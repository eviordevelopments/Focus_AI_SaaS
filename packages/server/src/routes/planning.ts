import express from 'express';
import db from '../db';
// Global middleware handles auth for MVP
const authenticateToken = (req: any, res: any, next: any) => next();
import type { Request, Response } from 'express';

const router = express.Router();

// Get all identity shifts for a user
router.get('/identity-shifts', authenticateToken, async (req: Request | any, res: Response) => {
    try {
        const shifts = await db('quarterly_identity_shifts')
            .where({ user_id: req.user.id })
            .orderBy('year', 'desc')
            .orderBy('quarter', 'desc');

        const shiftIds = shifts.map((s: any) => s.id);
        const outcomes = await db('quarterly_outcomes')
            .whereIn('identity_shift_id', shiftIds)
            .orderBy('order', 'asc');

        // Fetch systems for these shifts
        const systems = await db('focus_systems')
            .whereIn('identity_shift_id', shiftIds);

        // Attach outcomes and calculate progress
        const shiftsWithOutcomes = await Promise.all(shifts.map(async (s: any) => {
            const shiftOutcomes = outcomes.filter((o: any) => o.identity_shift_id === s.id);
            const shiftSystems = systems.filter((sys: any) => sys.identity_shift_id === s.id);

            // 1. Outcome Progress
            const outcomeProgress = shiftOutcomes.length > 0
                ? shiftOutcomes.reduce((acc: number, o: any) => acc + (o.current_value / o.target_value), 0) / shiftOutcomes.length
                : 0;

            // 2. System Adherence
            let systemAdherence = 0;
            if (shiftSystems.length > 0) {
                let startMonth = 0;
                if (s.quarter === 'Q2') startMonth = 3;
                else if (s.quarter === 'Q3') startMonth = 6;
                else if (s.quarter === 'Q4') startMonth = 9;
                const startDate = new Date(s.year, startMonth, 1);
                const endDate = new Date(s.year, startMonth + 3, 0);

                const sysIds = shiftSystems.map((sys: any) => sys.id);
                const logs = await db('daily_logs')
                    .whereIn('system_id', sysIds)
                    .where('date', '>=', startDate.toISOString().split('T')[0])
                    .where('date', '<=', endDate.toISOString().split('T')[0]);
                systemAdherence = logs.length > 0 ? logs.filter((l: any) => l.completed).length / logs.length : 0;
            }

            const combinedProgress = shiftSystems.length > 0
                ? (outcomeProgress * 0.4) + (systemAdherence * 0.6)
                : outcomeProgress;

            return {
                ...s,
                outcomes: shiftOutcomes,
                progress: Math.round(combinedProgress * 100),
                outcomeProgress: Math.round(outcomeProgress * 100),
                systemAdherence: Math.round(systemAdherence * 100)
            };
        }));

        res.json(shiftsWithOutcomes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch identity shifts' });
    }
});

// Create or Update Identity Shift
router.post('/identity-shifts', authenticateToken, async (req: Request | any, res: Response) => {
    try {
        const { quarter, year, primary_identity, vision_statement, life_area_id } = req.body;

        // check if exists (per area/quarter/year or global per quarter/year?)
        // User said "assign each area of life with the identity, systems..."
        // This implies one identity shift per area per quarter.
        const existing = await db('quarterly_identity_shifts')
            .where({ user_id: req.user.id, quarter, year, life_area_id })
            .first();

        if (existing) {
            await db('quarterly_identity_shifts')
                .where({ id: existing.id })
                .update({
                    primary_identity,
                    vision_statement,
                    life_area_id,
                    updated_at: db.fn.now()
                });
            const updated = await db('quarterly_identity_shifts').where({ id: existing.id }).first();
            res.json(updated);
        } else {
            const id = crypto.randomUUID();
            await db('quarterly_identity_shifts').insert({
                id,
                user_id: req.user.id,
                quarter,
                year,
                primary_identity,
                vision_statement,
                life_area_id
            });

            const created = await db('quarterly_identity_shifts').where({ id }).first();
            res.status(201).json(created);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save identity shift' });
    }
});

// 10-Year Vision Endpoints
router.get('/future-vision', authenticateToken, async (req: Request | any, res: Response) => {
    try {
        // Assuming target year is current year + 10, or just get the latest one
        const vision = await db('future_identities')
            .where({ user_id: req.user.id })
            .orderBy('target_year', 'desc')
            .first();
        res.json(vision || { description: '', target_year: new Date().getFullYear() + 10 });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch vision' });
    }
});

router.post('/future-vision', authenticateToken, async (req: Request | any, res: Response) => {
    try {
        const { description, target_year } = req.body;

        const existing = await db('future_identities')
            .where({ user_id: req.user.id, target_year })
            .first();

        if (existing) {
            await db('future_identities')
                .where({ id: existing.id })
                .update({ description, updated_at: db.fn.now() });
        } else {
            await db('future_identities').insert({
                id: crypto.randomUUID(),
                user_id: req.user.id,
                target_year,
                description
            });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save vision' });
    }
});

// Create Outcome
router.post('/outcomes', authenticateToken, async (req: Request | any, res: Response) => {
    try {
        const { identity_shift_id, title, life_area_id } = req.body;
        const id = crypto.randomUUID();

        // Get max order
        const last = await db('quarterly_outcomes')
            .where({ identity_shift_id })
            .max('order as maxOrder')
            .first();
        const order = (last?.maxOrder || 0) + 1;

        await db('quarterly_outcomes').insert({
            id,
            identity_shift_id,
            title,
            life_area_id,
            current_value: 0,
            target_value: 100,
            status: 'planned',
            order
        });

        const outcome = await db('quarterly_outcomes').where({ id }).first();
        res.status(201).json(outcome);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create outcome' });
    }
});

// Update Outcome
router.put('/outcomes/:id', authenticateToken, async (req: Request | any, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        await db('quarterly_outcomes')
            .where({ id })
            .update({
                ...updates,
                updated_at: db.fn.now()
            });

        const updated = await db('quarterly_outcomes').where({ id }).first();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update outcome' });
    }
});

// Delete Outcome
router.delete('/outcomes/:id', authenticateToken, async (req: Request | any, res: Response) => {
    try {
        await db('quarterly_outcomes').where({ id: req.params.id }).delete();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete outcome' });
    }
});

// Get planning stats (progression curve)
router.get('/stats', authenticateToken, async (req: Request | any, res: Response) => {
    try {
        const userId = req.user.id;
        const shifts = await db('quarterly_identity_shifts')
            .where({ user_id: userId })
            .orderBy('year', 'asc')
            .orderBy('quarter', 'asc');

        const shiftIds = shifts.map((s: any) => s.id);
        const outcomes = await db('quarterly_outcomes')
            .whereIn('identity_shift_id', shiftIds);

        const systems = await db('focus_systems')
            .whereIn('identity_shift_id', shiftIds);

        const stats = await Promise.all(shifts.map(async (s: any) => {
            // 1. Outcome Progress
            const shiftOutcomes = outcomes.filter((o: any) => o.identity_shift_id === s.id);
            const outcomeProgress = shiftOutcomes.length > 0
                ? shiftOutcomes.reduce((acc: number, o: any) => acc + (o.current_value / o.target_value), 0) / shiftOutcomes.length
                : 0;

            // 2. System Adherence
            const shiftSystems = systems.filter((sys: any) => sys.identity_shift_id === s.id);
            let systemAdherence = 0;

            if (shiftSystems.length > 0) {
                // Determine quarter date range
                let startMonth = 0;
                if (s.quarter === 'Q2') startMonth = 3;
                else if (s.quarter === 'Q3') startMonth = 6;
                else if (s.quarter === 'Q4') startMonth = 9;

                const startDate = new Date(s.year, startMonth, 1);
                const endDate = new Date(s.year, startMonth + 3, 0);

                const sysIds = shiftSystems.map((sys: any) => sys.id);
                const logs = await db('daily_logs')
                    .whereIn('system_id', sysIds)
                    .where('date', '>=', startDate.toISOString().split('T')[0])
                    .where('date', '<=', endDate.toISOString().split('T')[0]);

                const completed = logs.filter((l: any) => l.completed).length;
                // Rough estimate of scheduled days in the quarter (approx 90 days, but we should probably count logs found or assume daily for now)
                // A better way is to count how many logs we found total as the "denominator" if the user is tracking,
                // or use a fixed 90. Let's use total logs found as denominator if > 0.
                systemAdherence = logs.length > 0 ? completed / logs.length : 0;
            }

            // Combine both: 50/50 weighting for now
            const combinedProgress = shiftSystems.length > 0
                ? (outcomeProgress * 0.4) + (systemAdherence * 0.6)
                : outcomeProgress;

            return {
                period: `${s.year}-${s.quarter}`,
                progress: Math.round(combinedProgress * 100),
                outcomeProgress: Math.round(outcomeProgress * 100),
                systemAdherence: Math.round(systemAdherence * 100),
                identity: s.primary_identity
            };
        }));

        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch planning stats' });
    }
});

export default router;

import express from 'express';
import db from '../db';
import crypto from 'crypto';
import { format, startOfWeek, endOfWeek, getDay, subDays } from 'date-fns';

const router = express.Router();

// --- Systems ---
router.get('/systems', async (req: any, res) => {
    try {
        const systems = await db('focus_systems')
            .where({ user_id: req.user?.id })
            .select('*');
        res.json(systems);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch systems' });
    }
});

router.post('/systems', async (req: any, res) => {
    try {
        const id = crypto.randomUUID();
        const systemData = {
            id,
            user_id: req.user?.id,
            ...req.body,
            scheduled_days: JSON.stringify(req.body.scheduled_days || [])
        };

        await db.transaction(async (trx) => {
            await trx('focus_systems').insert(systemData);

            // Auto-create a default habit for this system so it appears on dashboard
            const daysMap: Record<string, number> = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };
            const scheduledDays = req.body.scheduled_days || [];
            const numericDays = Array.isArray(scheduledDays)
                ? scheduledDays.map((d: string) => daysMap[d] ?? -1).filter((d: number) => d !== -1)
                : [0, 1, 2, 3, 4, 5, 6];

            if (numericDays.length === 0 && Array.isArray(scheduledDays) && scheduledDays.length > 0) {
                // Fallback if mapping failed (maybe they are already numbers?)
                // But UI sends ['Mon', 'Fri']. 
            }

            const habitId = crypto.randomUUID();
            await trx('habits').insert({
                id: habitId,
                user_id: req.user?.id,
                system_id: id,
                name: req.body.name,
                description: req.body.description,
                days_of_week: JSON.stringify(numericDays),
                frequency: 'daily',
                habit_type: 'habit',
                is_active: true,
                base_xp: 25 // Default XP
            });
        });

        const system = await db('focus_systems').where({ id }).first();
        res.status(201).json(system);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create system' });
    }
});

router.put('/systems/:id', async (req: any, res) => {
    try {
        const updateData = { ...req.body };
        if (updateData.scheduled_days) {
            updateData.scheduled_days = JSON.stringify(updateData.scheduled_days);
        }
        await db('focus_systems')
            .where({ id: req.params.id, user_id: req.user?.id })
            .update(updateData);
        const system = await db('focus_systems').where({ id: req.params.id }).first();
        res.json(system);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update system' });
    }
});

router.delete('/systems/:id', async (req: any, res) => {
    try {
        await db('focus_systems')
            .where({ id: req.params.id, user_id: req.user?.id })
            .delete();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete system' });
    }
});

// --- Daily Logs ---
router.get('/logs', async (req: any, res) => {
    try {
        const { date, system_id } = req.query;
        let query = db('daily_logs').where({ user_id: req.user?.id });
        if (date) query = query.where({ date });
        if (system_id) query = query.where({ system_id });
        const logs = await query.select('*');
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

import { calculateXPEarned, updateStreak, checkAchievements } from '../services/gamification';

async function updateDaySummary(userId: string, date: string) {
    try {
        const todayDay = getDay(new Date(date));

        // 1. Calculate scheduled habits
        const habits = await db('habits').where({ user_id: userId, is_active: true });
        const scheduledHabits = habits.filter(h => {
            if (!h.days_of_week) return true; // Daily if not specified
            const days = JSON.parse(h.days_of_week);
            return days.includes(todayDay);
        });

        // 2. Calculate completed habits
        const logs = await db('daily_logs')
            .where({ user_id: userId, date, completed: true })
            .whereNotNull('habit_id');

        const xpSum = await db('daily_logs')
            .where({ user_id: userId, date })
            .sum('xp_earned as totalXP')
            .first();

        const qualityAvg = await db('daily_logs')
            .where({ user_id: userId, date })
            .whereNotNull('quality_rating')
            .avg('quality_rating as avgQuality')
            .first();

        const summaryData = {
            id: crypto.randomUUID(),
            user_id: userId,
            date,
            habits_scheduled: scheduledHabits.length,
            habits_completed: logs.length,
            completion_rate: scheduledHabits.length > 0 ? logs.length / scheduledHabits.length : 0,
            xp_earned: Number(xpSum?.totalXP || 0),
            average_habit_quality: qualityAvg?.avgQuality ? Math.round(Number(qualityAvg.avgQuality)) : null
        };

        await db('day_summaries')
            .insert(summaryData)
            .onConflict(['user_id', 'date'])
            .merge();

    } catch (error) {
        console.error('Failed to update day summary:', error);
    }
}

router.post('/logs', async (req: any, res) => {
    try {
        const id = crypto.randomUUID();
        const { system_id, habit_id, date, completed, effort_level } = req.body;

        const logData = {
            id,
            user_id: req.user?.id,
            system_id,
            habit_id: habit_id || null,
            date,
            completed,
            effort_level: effort_level || 3,
            mood: req.body.mood || 'good',
            energy_level: req.body.energy_level || 3,
            notes: req.body.notes || '',
            xp_earned: 0
        };

        // 1. Log the activity (Upsert based on habit + date or system + date if no habit)
        const conflictColumns = habit_id ? ['habit_id', 'date'] : ['system_id', 'date'];

        await db('daily_logs')
            .insert(logData)
            .onConflict(conflictColumns)
            .merge();

        let gamificationResult = null;

        // 2. If completed, trigger gamification logic
        if (completed) {
            const xpResult = await calculateXPEarned(req.user?.id, system_id, effort_level || 3, habit_id);
            const streakResult = await updateStreak(req.user?.id, system_id, date, habit_id);

            // Save XP to log
            await db('daily_logs').where({ id }).update({ xp_earned: xpResult.totalXP });

            // Update Identity XP if a supporting identity exists
            const system = await db('focus_systems').where({ id: system_id }).first();
            if (system?.identity_id) {
                await db('identities')
                    .where({ id: system.identity_id })
                    .increment('xp', xpResult.totalXP);

                // Check for level up
                const identity = await db('identities').where({ id: system.identity_id }).first();
                const newLevel = Math.floor(Math.sqrt(identity.xp / 100)) + 1;
                if (newLevel > identity.level) {
                    await db('identities').where({ id: system.identity_id }).update({ level: newLevel });
                }
            }

            gamificationResult = {
                xpEarned: xpResult.totalXP,
                streak: streakResult,
                multipliers: xpResult.multipliers,
                levelUp: false
            };
        }

        // 3. Update Day Summary
        await updateDaySummary(req.user?.id, date);

        const log = await db('daily_logs').where({ id }).first();
        res.status(201).json({ ...log, gamification: gamificationResult });
    } catch (error) {
        console.error('Logging error:', error);
        res.status(500).json({ error: 'Failed to log activity' });
    }
});

import { calculateBurnoutScore } from '../services/burnout';

// --- Burnout & Analytics (Stub/Initial) ---
router.get('/burnout/score', async (req: any, res) => {
    try {
        const result = await calculateBurnoutScore(req.user?.id);
        res.json(result);
    } catch (error) {
        console.error('Burnout calc error:', error);
        res.status(500).json({ error: 'Failed to calculate burnout score' });
    }
});

// --- Identities & Shifts ---
router.get('/identities', async (req: any, res) => {
    try {
        const identities = await db('quarterly_identity_shifts')
            .where({ user_id: req.user?.id })
            .orderBy('created_at', 'desc');
        res.json(identities);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch identities' });
    }
});

router.post('/identities', async (req: any, res) => {
    try {
        const { primary_identity, vision_statement, ten_year_vision, goals, quarter, year } = req.body;
        const [id] = await db('quarterly_identity_shifts').insert({
            user_id: req.user?.id,
            primary_identity,
            vision_statement,
            ten_year_vision,
            goals,
            quarter,
            year
        });
        res.json({ id });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create identity shift' });
    }
});

// --- Weekly Reviews ---
router.post('/reviews', async (req: any, res) => {
    try {
        const { wins, bottlenecks, adjustments, value_alignment_score } = req.body;
        const [id] = await db('weekly_reviews').insert({
            user_id: req.user?.id,
            start_date: format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
            end_date: format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
            wins,
            bottlenecks,
            adjustments,
            value_alignment_score: value_alignment_score || 3
        });
        res.json({ id });
    } catch (error) {
        console.error('Review save error:', error);
        res.status(500).json({ error: 'Failed to save weekly review' });
    }
});

// --- Habits ---
router.get('/habits', async (req: any, res) => {
    try {
        const { system_id } = req.query;
        let query = db('habits').where({ user_id: req.user?.id });
        if (system_id) query = query.where({ system_id });
        const habits = await query.orderBy('order', 'asc').select('*');
        res.json(habits);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch habits' });
    }
});

router.post('/habits', async (req: any, res) => {
    try {
        const id = crypto.randomUUID();
        const habitData = {
            id,
            user_id: req.user?.id,
            ...req.body,
            days_of_week: req.body.days_of_week ? JSON.stringify(req.body.days_of_week) : JSON.stringify([0, 1, 2, 3, 4, 5, 6])
        };
        await db('habits').insert(habitData);
        const habit = await db('habits').where({ id }).first();
        res.status(201).json(habit);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create habit' });
    }
});

router.put('/habits/:id', async (req: any, res) => {
    try {
        const updates = { ...req.body };
        if (updates.days_of_week) {
            updates.days_of_week = JSON.stringify(updates.days_of_week);
        }
        await db('habits')
            .where({ id: req.params.id, user_id: req.user?.id })
            .update(updates);
        const habit = await db('habits').where({ id: req.params.id }).first();
        res.json(habit);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update habit' });
    }
});

router.delete('/habits/:id', async (req: any, res) => {
    try {
        await db('habits')
            .where({ id: req.params.id, user_id: req.user?.id })
            .delete();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete habit' });
    }
});

router.get('/stats/habits/overview', async (req: any, res) => {
    try {
        const { period } = req.query; // year, quarter, month, week
        const userId = req.user?.id;

        let days = 7;
        if (period === 'month') days = 30;
        if (period === 'quarter') days = 90;
        if (period === 'year') days = 365;

        const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');

        const stats = await db('day_summaries')
            .where({ user_id: userId })
            .where('date', '>=', startDate)
            .orderBy('date', 'asc');

        // Overall metrics
        const totals = stats.reduce((acc, curr) => ({
            xp: acc.xp + curr.xp_earned,
            scheduled: acc.scheduled + curr.habits_scheduled,
            completed: acc.completed + curr.habits_completed
        }), { xp: 0, scheduled: 0, completed: 0 });

        const avgAdherence = totals.scheduled > 0 ? (totals.completed / totals.scheduled) * 100 : 0;

        res.json({
            stats,
            summary: {
                totalXP: totals.xp,
                avgAdherence: Math.round(avgAdherence),
                daysTracked: stats.length
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch habit stats' });
    }
});

router.get('/habits/:id/analytics', async (req: any, res) => {
    try {
        const habitId = req.params.id;
        const logs = await db('daily_logs')
            .where({ habit_id: habitId, user_id: req.user?.id })
            .orderBy('date', 'asc')
            .limit(90);

        const streak = await db('streaks')
            .where({ habit_id: habitId, user_id: req.user?.id })
            .first();

        // Calculate adherence
        const totalLogs = logs.length;
        const fulfilledLogs = logs.filter(l => l.completed).length;
        const adherence = totalLogs > 0 ? (fulfilledLogs / totalLogs) * 100 : 0;

        res.json({
            history: logs,
            streak: streak?.current_streak || 0,
            bestStreak: streak?.best_streak || 0,
            adherence: Math.round(adherence),
            daysMissed: totalLogs - fulfilledLogs,
            daysFulfilled: fulfilledLogs
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch habit analytics' });
    }
});

// --- Life Areas (Extended CRUD) ---
router.post('/life-areas', async (req: any, res) => {
    try {
        const id = crypto.randomUUID();
        const data = { id, user_id: req.user?.id, ...req.body };
        await db('life_areas').insert(data);
        const area = await db('life_areas').where({ id }).first();
        res.status(201).json(area);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create life area' });
    }
});

router.put('/life-areas/:id', async (req: any, res) => {
    try {
        await db('life_areas').where({ id: req.params.id, user_id: req.user?.id }).update(req.body);
        const area = await db('life_areas').where({ id: req.params.id }).first();
        res.json(area);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update life area' });
    }
});

router.delete('/life-areas/:id', async (req: any, res) => {
    try {
        await db('life_areas').where({ id: req.params.id, user_id: req.user?.id }).delete();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete life area' });
    }
});

// --- Projects ---
router.get('/projects', async (req: any, res) => {
    try {
        const { lifeAreaId } = req.query;
        let query = db('projects').where({ user_id: req.user?.id });
        if (lifeAreaId) query = query.where({ life_area_id: lifeAreaId });
        const projects = await query.select('*');
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

router.post('/projects', async (req: any, res) => {
    try {
        const id = crypto.randomUUID();
        const data = { id, user_id: req.user?.id, ...req.body };
        await db('projects').insert(data);
        const project = await db('projects').where({ id }).first();
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create project' });
    }
});

// --- Artifacts Generic (Books, Notes, Reviews) ---
const ARTIFACT_TABLES: Record<string, string> = {
    'books': 'books',
    'notes': 'notes',
    'reviews': 'reviews_v2'
};

router.get('/artifacts/:type', async (req: any, res) => {
    try {
        const table = ARTIFACT_TABLES[req.params.type];
        if (!table) return res.status(400).json({ error: 'Invalid artifact type' });
        const { lifeAreaId } = req.query;
        let query = db(table).where({ user_id: req.user?.id });
        if (lifeAreaId) query = query.where({ life_area_id: lifeAreaId });
        const artifacts = await query.select('*');
        res.json(artifacts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch artifacts' });
    }
});

router.post('/artifacts/:type', async (req: any, res) => {
    try {
        const table = ARTIFACT_TABLES[req.params.type];
        if (!table) return res.status(400).json({ error: 'Invalid artifact type' });
        const id = crypto.randomUUID();
        const data = { id, user_id: req.user?.id, ...req.body };
        await db(table).insert(data);
        const artifact = await db(table).where({ id }).first();
        res.status(201).json(artifact);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create artifact' });
    }
});

// --- Stats Overview (Pie Chart Data) ---
router.get('/stats/areas/overview', async (req: any, res) => {
    try {
        const userId = req.user?.id;
        const areas = await db('life_areas').where({ user_id: userId });

        const areaStats = await Promise.all(areas.map(async (area) => {
            const habits = await db('habits').where({ area_id: area.id, user_id: userId });
            const logs = await db('daily_logs')
                .where({ user_id: userId })
                .whereIn('habit_id', habits.map(h => h.id));

            const completionRate = habits.length > 0
                ? (logs.filter(l => l.completed).length / (habits.length * 30)) // Rough month adherence
                : 0;

            const activeSystems = await db('focus_systems').where({ life_area_id: area.id, user_id: userId }).count('id as count');
            const openProjects = await db('projects').where({ life_area_id: area.id, user_id: userId, status: 'active' }).count('id as count');

            return {
                ...area,
                completion_rate: Math.min(completionRate, 1),
                active_systems: activeSystems[0].count,
                open_projects: openProjects[0].count
            };
        }));

        res.json(areaStats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch area stats' });
    }
});

export default router;

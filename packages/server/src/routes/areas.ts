import express from 'express';
import db from '../db';

const router = express.Router();

// Auth handled by global middleware
const authenticateToken = (req: any, res: any, next: any) => next();

import crypto from 'crypto';

// GET all areas for a user
router.get('/', authenticateToken, async (req: any, res) => {
    try {
        const areas = await db('life_areas')
            .where({ user_id: req.user.id })
            .select('*');
        res.json(areas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch life areas' });
    }
});

router.post('/', authenticateToken, async (req: any, res) => {
    try {
        const id = crypto.randomUUID();
        const data = { id, user_id: req.user.id, ...req.body };
        await db('life_areas').insert(data);
        const area = await db('life_areas').where({ id }).first();
        res.status(201).json(area);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create life area' });
    }
});

router.put('/:id', authenticateToken, async (req: any, res) => {
    try {
        await db('life_areas')
            .where({ id: req.params.id, user_id: req.user.id })
            .update(req.body);
        const area = await db('life_areas').where({ id: req.params.id }).first();
        res.json(area);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update life area' });
    }
});

router.delete('/:id', authenticateToken, async (req: any, res) => {
    try {
        await db('life_areas')
            .where({ id: req.params.id, user_id: req.user.id })
            .delete();
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete life area' });
    }
});

// GET full workspace data for a specific area
router.get('/:id/workspace', authenticateToken, async (req: any, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // 1. Fetch Area Details
        const area = await db('life_areas').where({ id, user_id: userId }).first();
        if (!area) return res.status(404).json({ error: 'Area not found' });

        // 2. Fetch Projects
        const projects = await db('projects').where({ life_area_id: id, user_id: userId });

        // 3. Fetch Systems & Habits related to Area
        const systems = await db('focus_systems').where({ life_area_id: id, user_id: userId });
        const systemIds = systems.map(s => s.id);
        const habits = await db('habits').where({ user_id: userId }).where((builder) => {
            builder.whereIn('system_id', systemIds).orWhere({ life_area_id: id });
        });

        // 4. Fetch Identity Shifts & Outcomes
        const identityShifts = await db('quarterly_identity_shifts').where({ life_area_id: id, user_id: userId });
        const outcomes = await db('quarterly_outcomes').where({ life_area_id: id });

        // 5. Fetch Resources/Attachments
        const resources = await db('resource_attachments').where({ life_area_id: id, user_id: userId });

        // 6. Fetch Tasks (linked to projects in this area)
        const projectIds = projects.map(p => p.id);
        const tasks = await db('tasks').whereIn('project_id', projectIds);

        // 7. Fetch Health Data (if area is Health)
        let healthEntries: any[] = [];
        if (area.name.toLowerCase() === 'health') {
            healthEntries = await db('health_entries')
                .where({ user_id: userId })
                .orderBy('date', 'desc')
                .limit(30);
        }

        res.json({
            area,
            projects,
            systems,
            habits,
            identity_shifts: identityShifts,
            outcomes,
            resources,
            tasks,
            health_entries: healthEntries
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch workspace data' });
    }
});

export default router;

import express from 'express';
import db from '../db';
import crypto from 'crypto';

const router = express.Router();

// Auth handled by global middleware
const authenticateToken = (req: any, res: any, next: any) => next();

// GET all projects for a user
router.get('/', authenticateToken, async (req: any, res) => {
    try {
        const { life_area_id } = req.query;
        let query = db('projects').where({ user_id: req.user.id });
        if (life_area_id) query = query.where({ life_area_id });

        const projects = await query.select('*').orderBy('created_at', 'desc');
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// POST new project
router.post('/', authenticateToken, async (req: any, res) => {
    try {
        const id = crypto.randomUUID();
        const { name, life_area_id, status, deadline } = req.body;

        await db('projects').insert({
            id,
            user_id: req.user.id,
            life_area_id,
            name,
            status: status || 'active',
            deadline,
            progress: 0
        });

        const project = await db('projects').where({ id }).first();
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create project' });
    }
});

// PUT update project
router.put('/:id', authenticateToken, async (req: any, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        await db('projects')
            .where({ id, user_id: req.user.id })
            .update({
                ...updates,
                updated_at: db.fn.now()
            });

        const project = await db('projects').where({ id }).first();
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update project' });
    }
});

// DELETE project
router.delete('/:id', authenticateToken, async (req: any, res) => {
    try {
        await db('projects').where({ id: req.params.id, user_id: req.user.id }).delete();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

export default router;

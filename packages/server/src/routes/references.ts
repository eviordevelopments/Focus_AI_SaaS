import express from 'express';
import db from '../db';
import crypto from 'crypto';

const router = express.Router();

// Auth handled by global middleware
const authenticateToken = (req: any, res: any, next: any) => next();

// GET all references for a user
router.get('/', authenticateToken, async (req: any, res) => {
    try {
        const { life_area_id, project_id, type } = req.query;
        let query = db('references').where({ user_id: req.user.id });

        if (life_area_id) query = query.where({ life_area_id });
        if (project_id) query = query.where({ project_id });
        if (type) query = query.where({ type });

        const references = await query.select('*').orderBy('created_at', 'desc');
        res.json(references);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch references' });
    }
});

// POST new reference
router.post('/', authenticateToken, async (req: any, res) => {
    try {
        const id = crypto.randomUUID();
        const { title, description, type, content, url, file_path, tags, life_area_id, project_id, task_id } = req.body;

        await db('references').insert({
            id,
            user_id: req.user.id,
            life_area_id,
            project_id,
            task_id,
            title,
            description,
            type,
            content,
            url,
            file_path,
            tags: tags ? JSON.stringify(tags) : null,
            created_at: db.fn.now(),
            updated_at: db.fn.now()
        });

        const reference = await db('references').where({ id }).first();
        res.status(201).json(reference);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create reference' });
    }
});

// PUT update reference
router.put('/:id', authenticateToken, async (req: any, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };

        if (updates.tags) {
            updates.tags = JSON.stringify(updates.tags);
        }

        updates.updated_at = db.fn.now();

        await db('references')
            .where({ id, user_id: req.user.id })
            .update(updates);

        const reference = await db('references').where({ id }).first();
        res.json(reference);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update reference' });
    }
});

// DELETE reference
router.delete('/:id', authenticateToken, async (req: any, res) => {
    try {
        await db('references').where({ id: req.params.id, user_id: req.user.id }).delete();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete reference' });
    }
});

export default router;

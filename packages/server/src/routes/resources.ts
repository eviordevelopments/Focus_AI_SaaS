import express from 'express';
import db from '../db';
import crypto from 'crypto';

const router = express.Router();

// Auth handled by global middleware
const authenticateToken = (req: any, res: any, next: any) => next();

// GET all resources for an area
router.get('/area/:areaId', authenticateToken, async (req: any, res) => {
    try {
        const { areaId } = req.params;
        const resources = await db('resource_attachments')
            .where({ life_area_id: areaId, user_id: req.user.id })
            .orderBy('created_at', 'desc');
        res.json(resources);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch resources' });
    }
});

// POST new resource
router.post('/', authenticateToken, async (req: any, res) => {
    try {
        const { name, file_url, file_type, life_area_id, project_id, metadata } = req.body;
        const userId = req.user.id;

        const id = crypto.randomUUID();
        const resourceData = {
            id,
            user_id: userId,
            life_area_id,
            project_id: project_id || null,
            name,
            file_url,
            file_type,
            metadata: metadata ? JSON.stringify(metadata) : null
        };

        await db('resource_attachments').insert(resourceData);
        const resource = await db('resource_attachments').where({ id }).first();
        res.status(201).json(resource);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create resource attachment' });
    }
});

// DELETE resource
router.delete('/:id', authenticateToken, async (req: any, res) => {
    try {
        await db('resource_attachments')
            .where({ id: req.params.id, user_id: req.user.id })
            .delete();
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete resource' });
    }
});

export default router;

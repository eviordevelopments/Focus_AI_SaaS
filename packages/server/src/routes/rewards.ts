import express from 'express';
import db from '../db';
import crypto from 'crypto';

const router = express.Router();

// Get all planted trees for the user
router.get('/trees', async (req: any, res) => {
    try {
        const trees = await db('planted_trees')
            .where({ user_id: req.user?.id })
            .orderBy('planted_at', 'asc');
        res.json(trees);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch garden' });
    }
});

// Plant a new tree
router.post('/plant', async (req: any, res) => {
    try {
        const { session_id, tree_type, x, y } = req.body;
        const id = crypto.randomUUID();

        await db('planted_trees').insert({
            id,
            user_id: req.user?.id,
            session_id,
            tree_type,
            position_x: x || Math.random() * 80 + 10, // Default random range
            position_y: y || Math.random() * 80 + 10,
            island_index: 0
        });

        const tree = await db('planted_trees').where({ id }).first();
        res.status(201).json(tree);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to plant tree' });
    }
});

// Get unlocked assets
router.get('/assets', async (req: any, res) => {
    try {
        const assets = await db('unlocked_assets').where({ user_id: req.user?.id });
        res.json(assets);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch assets' });
    }
});

export default router;

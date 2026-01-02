import express from 'express';
import db from '../db';

const router = express.Router();

// GET all areas for a user (Assuming single user for MVP, fetching first user or query param)
// For MVP we will just fetch all areas since we have one user seed.
router.get('/', async (req, res) => {
    try {
        const areas = await db('life_areas').select('*');
        res.json(areas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch life areas' });
    }
});

export default router;

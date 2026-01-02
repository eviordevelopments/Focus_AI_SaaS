import express from 'express';
import db from '../db';

const router = express.Router();

// GET /habits - List habits for user
router.get('/', async (req, res) => {
    try {
        const userId = req.query.userId as string;
        // Fallback or error if no userId?
        // Ideally strict, but for MVP flexibility:
        let queryUserId = userId;
        if (!queryUserId) {
            const user = await db('users').first();
            queryUserId = user?.id;
        }

        if (!queryUserId) return res.status(400).json({ error: 'User ID required' });

        const habits = await db('habits').where('user_id', queryUserId);

        // Parse completed_dates if stored as JSON string (SQLite/Knex might auto-parse depending on config, but safe to check)
        // If using 'json' type in postgres it's auto, in sqlite it's string.
        const parsedHabits = habits.map(h => ({
            ...h,
            completed_dates: typeof h.completed_dates === 'string' ? JSON.parse(h.completed_dates) : h.completed_dates
        }));

        res.json(parsedHabits);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch habits' });
    }
});

// POST /habits - Create habit
router.post('/', async (req, res) => {
    try {
        const { title, frequency, userId } = req.body;

        if (!userId) return res.status(400).json({ error: 'User ID required' });

        const [habit] = await db('habits').insert({
            user_id: userId,
            title,
            frequency: frequency || 'daily',
            completed_dates: JSON.stringify([])
        }).returning('*');

        // Parse for returning
        habit.completed_dates = JSON.parse(habit.completed_dates as string);

        res.status(201).json(habit);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create habit' });
    }
});

// PUT /habits/:id - Update habit (toggle completion usually)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Ensure stringifying only if needed
        if (updates.completed_dates && typeof updates.completed_dates !== 'string') {
            updates.completed_dates = JSON.stringify(updates.completed_dates);
        }

        const [habit] = await db('habits')
            .where('id', id)
            .update(updates)
            .returning('*');

        if (habit && typeof habit.completed_dates === 'string') {
            habit.completed_dates = JSON.parse(habit.completed_dates);
        }

        res.json(habit);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update habit' });
    }
});

export default router;

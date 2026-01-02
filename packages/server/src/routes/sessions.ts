import express from 'express';
import db from '../db';

const router = express.Router();

// GET recent sessions (stats)
router.get('/recent', async (req, res) => {
    try {
        const sessions = await db('sessions')
            .orderBy('start_time', 'desc')
            .limit(10);
        res.json(sessions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch recent sessions' });
    }
});

// POST start session
router.post('/start', async (req, res) => {
    try {
        const { user_id, task_id, type, planned_minutes } = req.body;

        // For MVP, if no user_id is provided, grab the first one
        let targetUserId = user_id;
        if (!targetUserId) {
            const user = await db('users').first();
            if (user) targetUserId = user.id;
        }

        const [session] = await db('sessions').insert({
            user_id: targetUserId,
            task_id: task_id || null, // Optional
            type,
            planned_minutes,
            start_time: new Date(),
        }).returning('*');

        res.status(201).json(session);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to start session' });
    }
});

// POST finish session (end_time, metrics)
router.post('/:id/finish', async (req, res) => {
    try {
        const { id } = req.params;
        const { actual_minutes, focus_quality, distractions, notes } = req.body;

        const [updatedSession] = await db('sessions')
            .where('id', id)
            .update({
                end_time: new Date(),
                actual_minutes: actual_minutes || 0, // Should calculate diff on server ideally, but trusting client for MVP
                focus_quality,
                distractions,
                notes
            })
            .returning('*');

        if (!updatedSession) {
            return res.status(404).json({ error: 'Session not found' });
        }

        res.json(updatedSession);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to finish session' });
    }
});

export default router;

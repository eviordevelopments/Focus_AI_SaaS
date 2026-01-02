import express from 'express';
import db from '../db';

const router = express.Router();

// GET today's entry
router.get('/today', async (req, res) => {
    try {
        // Determine "today" based on client local time or server time? 
        // Ideally client sends date, but for MVP we use server's YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];
        const user = await db('users').first(); // MVP: Single user
        if (!user) return res.status(404).json({ error: 'User not found' });

        const entry = await db('health_entries')
            .where({ user_id: user.id, date: today })
            .first();

        res.json(entry || null);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch health entry' });
    }
});

// POST daily log (Upsert)
router.post('/daily', async (req, res) => {
    try {
        const { date, sleep_hours, mood, stress, screen_time_hours, exercise_minutes } = req.body;
        const user = await db('users').first();
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Check if exists
        const existing = await db('health_entries')
            .where({ user_id: user.id, date })
            .first();

        if (existing) {
            const [updated] = await db('health_entries')
                .where({ id: existing.id })
                .update({
                    sleep_hours,
                    mood,
                    stress,
                    screen_time_hours,
                    exercise_minutes
                })
                .returning('*');
            res.json(updated);
        } else {
            const [created] = await db('health_entries')
                .insert({
                    user_id: user.id,
                    date,
                    sleep_hours,
                    mood,
                    stress,
                    screen_time_hours,
                    exercise_minutes
                })
                .returning('*');
            res.status(201).json(created);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save health entry' });
    }
});

// GET History (Last 7 days)
router.get('/history', async (req, res) => {
    try {
        const user = await db('users').first();
        if (!user) return res.status(404).json({ error: 'User not found' });

        const history = await db('health_entries')
            .where('user_id', user.id)
            .orderBy('date', 'asc') // Ascending for charts
            .limit(7);

        // If less than 7 days, might want to fill with empty or just return what exists
        // Converting to array to ensure order if limit logic affected it (SQL limit applies before order usually if not subquery, but here we want last 7 days.
        // Actually: orderBy desc limit 7 gives last 7, but reverse order. We want asc for charts.
        // So: Fetch desc limit 7, then sort asc in JS.

        const last7 = await db('health_entries')
            .where('user_id', user.id)
            .orderBy('date', 'desc')
            .limit(7);

        const sorted = last7.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        res.json(sorted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch health history' });
    }
});

// GET Burnout Score
router.get('/burnout', async (req, res) => {
    try {
        const user = await db('users').first();
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Get last 7 entries
        const entries = await db('health_entries')
            .where('user_id', user.id)
            .orderBy('date', 'desc')
            .limit(7);

        if (entries.length === 0) {
            return res.json({ score: 0, level: 'Unknown', factors: ['No data yet'] });
        }

        // Simple Algorithm
        // 1. Sleep: < 6h (+20 pts), 6-7h (+10 pts)
        // 2. Stress: > 8 (+20 pts), > 5 (+10 pts)
        // 3. Mood: < 4 (+20 pts), < 6 (+10 pts)
        // 4. Exercise: 0 (+10 pts)
        // Avg over last 7 days

        let totalScore = 0;
        const factors = new Set<string>();

        // Average metrics
        const avg = (key: string) => entries.reduce((s, e) => s + e[key], 0) / entries.length;

        const avgSleep = avg('sleep_hours');
        const avgStress = avg('stress');
        const avgMood = avg('mood');
        const avgExercise = avg('exercise_minutes');

        if (avgSleep < 6) { totalScore += 30; factors.add('Low Sleep'); }
        else if (avgSleep < 7) { totalScore += 15; factors.add('Suboptimal Sleep'); }

        if (avgStress >= 8) { totalScore += 30; factors.add('High Stress'); }
        else if (avgStress >= 6) { totalScore += 15; factors.add('Elevated Stress'); }

        if (avgMood <= 4) { totalScore += 30; factors.add('Low Mood'); }
        else if (avgMood <= 6) { totalScore += 15; factors.add('Varied Mood'); }

        if (avgExercise < 15) { totalScore += 10; factors.add('Low Activity'); }

        // Cap at 100
        const score = Math.min(100, totalScore);

        // Level
        let level = 'Healthy';
        if (score > 70) level = 'Critical Burnout Risk';
        else if (score > 40) level = 'Warning Signs';
        else if (score > 20) level = 'Mild Strain';

        res.json({
            score,
            level,
            factors: Array.from(factors)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to calculate burnout' });
    }
});

export default router;

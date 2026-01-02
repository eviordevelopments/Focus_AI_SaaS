import express from 'express';
import db from '../db';
import crypto from 'crypto';
import { calculateXPEarned, updateStreak, checkAchievements } from '../services/gamification';

const router = express.Router();

// --- Identities ---
router.get('/identities', async (req: any, res) => {
    try {
        const identities = await db('identities')
            .where({ user_id: req.user?.id })
            .select('*');
        res.json(identities);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch identities' });
    }
});

router.post('/identities', async (req: any, res) => {
    try {
        const id = crypto.randomUUID();
        const { name, life_area_id } = req.body;
        await db('identities').insert({
            id,
            user_id: req.user?.id,
            name,
            life_area_id,
            level: 1,
            xp: 0
        });
        const identity = await db('identities').where({ id }).first();
        res.status(201).json(identity);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create identity' });
    }
});

// --- Streaks ---
router.get('/streaks', async (req: any, res) => {
    try {
        const streaks = await db('streaks')
            .where({ user_id: req.user?.id });
        res.json(streaks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch streaks' });
    }
});

// --- Achievements ---
router.get('/achievements', async (req: any, res) => {
    try {
        const achievements = await db('achievements')
            .where({ user_id: req.user?.id });
        res.json(achievements);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch achievements' });
    }
});

// --- Gamification Dashboard ---
router.get('/dashboard', async (req: any, res) => {
    try {
        const userId = req.user?.id;
        const today = new Date().toISOString().split('T')[0];

        // 1. Calculate Total XP
        const identities = await db('identities').where({ user_id: userId });
        const totalXP = identities.reduce((acc, curr) => acc + curr.xp, 0);

        // 2. Fetch Streaks & Achievements
        const streaks = await db('streaks').where({ user_id: userId });
        const achievements = await db('achievements').where({ user_id: userId });

        // 3. Calculate Daily Compliance
        // Fetch all habits for this user
        const habits = await db('habits').where({ user_id: userId });
        const habitIds = habits.map(h => h.id);

        // Fetch logs for today for these habits
        const todayLogs = await db('daily_logs')
            .where({ user_id: userId, date: today })
            .whereIn('habit_id', habitIds)
            .where({ completed: true });

        const habitCount = habits.length;
        const completedCount = todayLogs.length;
        const dailyCompliance = habitCount > 0 ? (completedCount / habitCount) * 100 : 0;

        res.json({
            totalXP,
            totalStreaks: streaks.length,
            achievementsCount: achievements.length,
            dailyCompliance: Math.round(dailyCompliance),
            identities
        });
    } catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).json({ error: 'Failed to fetch gamification dashboard' });
    }
});

// --- Analytics & Trends ---
router.get('/analytics/trends', async (req: any, res) => {
    try {
        const userId = req.user?.id;
        // Fetch last 12 weeks of data
        const trends = await db('burnout_factors')
            .where({ user_id: userId })
            .orderBy('date', 'asc')
            .limit(90); // ~3 months

        // Simple aggregation for chart (could be more complex)
        res.json(trends);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch analytics trends' });
    }
});

export default router;

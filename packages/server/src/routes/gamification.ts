import express from 'express';
import db from '../db';
import crypto from 'crypto';
import { calculateXPEarned, updateStreak, checkAchievements } from '../services/gamification';
import { getDay, parseISO } from 'date-fns';

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

        // 3. Calculate Daily Compliance (Scheduled Habits Only)
        const parsedDate = parseISO(today);
        const dayOfWeek = getDay(parsedDate);

        // Fetch all habits for this user
        const habits = await db('habits').where({ user_id: userId, is_active: true });

        const scheduledHabits = habits.filter(h => {
            if (!h.days_of_week) return true;
            try {
                const days = typeof h.days_of_week === 'string' ? JSON.parse(h.days_of_week) : h.days_of_week;
                return Array.isArray(days) && days.includes(dayOfWeek);
            } catch (e) {
                return true;
            }
        });

        const scheduledHabitIds = scheduledHabits.map(h => h.id);

        // Fetch logs for today for these habits
        const todayLogs = await db('daily_logs')
            .where({ user_id: userId, date: today, completed: true })
            .whereIn('habit_id', scheduledHabitIds);

        const scheduledCount = scheduledHabits.length;
        const completedCount = todayLogs.length;
        const dailyCompliance = scheduledCount > 0 ? (completedCount / scheduledCount) * 100 : 0;

        // 4. Calculate Average Progress (last 30 days)
        const avgProgress = await db('day_summaries')
            .where({ user_id: userId })
            .where('date', '>=', db.raw("date('now', '-30 days')"))
            .avg('completion_rate as avg')
            .first();

        // 5. Total Results (Total completed actions across all time)
        const totalResults = await db('daily_logs')
            .where({ user_id: userId, completed: true })
            .count('id as count')
            .first();

        const xp = totalXP;
        const level = Math.floor(Math.sqrt(xp / 100)) + 1;
        const mastery = Math.floor(level / 10) + 1;

        res.json({
            totalXP,
            level,
            mastery,
            totalStreaks: streaks.length,
            achievementsCount: achievements.length,
            dailyCompliance: Math.round(dailyCompliance),
            avgProgress: Math.round((avgProgress?.avg || 0) * 100),
            totalResults: totalResults?.count || 0,
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

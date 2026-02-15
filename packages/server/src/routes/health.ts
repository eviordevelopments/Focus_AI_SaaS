import express from 'express';
import db from '../db';
import crypto from 'crypto';

const router = express.Router();

// Auth handled by global middleware
const authenticateToken = (req: any, res: any, next: any) => next();

// GET health entry for today
router.get('/today', authenticateToken, async (req: any, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const entry = await db('health_entries')
            .where({ user_id: req.user.id, date: today })
            .first();
        res.json(entry || null);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch today\'s health entry' });
    }
});

// GET all entries for a user
router.get('/', authenticateToken, async (req: any, res) => {
    try {
        const entries = await db('health_entries')
            .where({ user_id: req.user.id })
            .orderBy('date', 'desc');
        res.json(entries);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch health entries' });
    }
});

// GET health history (alias for backward compatibility)
router.get('/history', authenticateToken, async (req: any, res) => {
    try {
        const entries = await db('health_entries')
            .where({ user_id: req.user.id })
            .orderBy('date', 'desc');
        res.json(entries);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch health entries' });
    }
});

// POST new entry
router.post('/', authenticateToken, async (req: any, res) => {
    try {
        const { date, sleep_hours, mood, stress, screen_time_hours, exercise_minutes } = req.body;
        const userId = req.user.id;

        // Import health rules for burnout calculation
        const { calculateBurnoutScore } = await import('../utils/healthRules');

        // Calculate burnout score
        const burnoutResult = calculateBurnoutScore({
            sleep_hours,
            mood,
            stress,
            exercise_minutes,
            screen_time_hours
        });

        const id = crypto.randomUUID();
        const entryData = {
            id,
            user_id: userId,
            date,
            sleep_hours,
            mood,
            stress,
            screen_time_hours: screen_time_hours || 0,
            exercise_minutes: exercise_minutes || 0,
            logged_at: new Date().toISOString(),
            burnout_score: burnoutResult.overall_score
        };

        // Use onConflict to allow updating entries for the same day
        await db('health_entries')
            .insert(entryData)
            .onConflict(['user_id', 'date'])
            .merge({
                sleep_hours,
                mood,
                stress,
                screen_time_hours,
                exercise_minutes,
                logged_at: new Date().toISOString(),
                burnout_score: burnoutResult.overall_score,
                created_at: db.fn.now()
            });

        // Update streak
        await updateStreak(userId, date);

        const entry = await db('health_entries').where({ user_id: userId, date }).first();
        res.status(201).json(entry);
    } catch (error) {
        console.error('Health logging error:', error);
        res.status(500).json({ error: 'Failed to create/update health entry' });
    }
});

// Helper function to update streak
async function updateStreak(userId: string, date: string) {
    const streak = await db('health_streaks').where({ user_id: userId }).first();
    const today = new Date(date);

    if (!streak) {
        // Create new streak
        await db('health_streaks').insert({
            id: crypto.randomUUID(),
            user_id: userId,
            current_streak: 1,
            longest_streak: 1,
            last_logged_date: date,
            total_xp: 10
        });
    } else {
        const lastLogged = new Date(streak.last_logged_date);
        const daysDiff = Math.floor((today.getTime() - lastLogged.getTime()) / (1000 * 60 * 60 * 24));

        let newStreak = streak.current_streak;
        if (daysDiff === 1) {
            // Consecutive day
            newStreak += 1;
        } else if (daysDiff > 1) {
            // Streak broken
            newStreak = 1;
        }
        // If daysDiff === 0, same day, don't change streak

        await db('health_streaks')
            .where({ user_id: userId })
            .update({
                current_streak: newStreak,
                longest_streak: Math.max(newStreak, streak.longest_streak),
                last_logged_date: date,
                total_xp: streak.total_xp + 10
            });
    }
}

// GET health analytics aggregation
router.get('/analytics', authenticateToken, async (req: any, res) => {
    try {
        const { period = 'month' } = req.query;
        const userId = req.user.id;

        let startDate: Date;
        const endDate = new Date();

        switch (period) {
            case 'week':
                startDate = new Date(endDate);
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate = new Date(endDate);
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case 'year':
                startDate = new Date(endDate);
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            default:
                startDate = new Date(endDate);
                startDate.setMonth(startDate.getMonth() - 1);
        }

        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];

        const entries = await db('health_entries')
            .where({ user_id: userId })
            .whereBetween('date', [startDateStr, endDateStr])
            .orderBy('date', 'asc');

        // Get all historical data for personal bests/lows
        const allEntries = await db('health_entries')
            .where({ user_id: userId })
            .select('*');

        const buildMetricData = (field: string) => {
            const values = allEntries.map((e: any) => e[field]).filter((v: any) => v != null);
            const personalBest = values.length > 0 ? Math.max(...values) : 0;
            const personalLow = values.length > 0 ? Math.min(...values) : 0;

            const timeSeries = entries.map((entry: any) => ({
                date: entry.date,
                value: entry[field] || 0,
                personalBest,
                personalLow
            }));

            const currentValues = entries.map((e: any) => e[field] || 0);
            const currentAvg = currentValues.length > 0
                ? currentValues.reduce((a: number, b: number) => a + b, 0) / currentValues.length
                : 0;

            return {
                timeSeries,
                stats: {
                    currentAvg: Math.round(currentAvg * 10) / 10,
                    bestEver: personalBest,
                    lowestEver: personalLow
                }
            };
        };

        res.json({
            sleep: buildMetricData('sleep_hours'),
            mood: buildMetricData('mood'),
            stress: buildMetricData('stress'),
            exercise: buildMetricData('exercise_minutes'),
            screen: buildMetricData('screen_time_hours')
        });
    } catch (error) {
        console.error('Health analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch health analytics' });
    }
});

// GET burnout score and recommendations
router.get('/burnout-score', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user.id;

        // Import health rules
        const { calculateBurnoutScore, checkAchievements, calculateLevel } = await import('../utils/healthRules');

        // Get last 7 days of entries
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

        const recentEntries = await db('health_entries')
            .where({ user_id: userId })
            .where('date', '>=', sevenDaysAgoStr)
            .orderBy('date', 'desc');

        if (recentEntries.length === 0) {
            return res.json({
                overall_score: 0,
                risk_level: 'unknown',
                breakdown: {},
                recommendations: ['Start logging your health metrics to get personalized insights'],
                doctor_referral: false,
                streak_days: 0,
                achievements: [],
                level: { level: 'bronze', progress: 0, nextLevel: 100 }
            });
        }

        // Calculate average metrics from last 7 days
        const avgMetrics = {
            sleep_hours: recentEntries.reduce((sum, e) => sum + (e.sleep_hours || 0), 0) / recentEntries.length,
            mood: recentEntries.reduce((sum, e) => sum + (e.mood || 0), 0) / recentEntries.length,
            stress: recentEntries.reduce((sum, e) => sum + (e.stress || 0), 0) / recentEntries.length,
            exercise_minutes: recentEntries.reduce((sum, e) => sum + (e.exercise_minutes || 0), 0) / recentEntries.length,
            screen_time_hours: recentEntries.reduce((sum, e) => sum + (e.screen_time_hours || 0), 0) / recentEntries.length
        };

        // Calculate burnout score
        const burnoutResult = calculateBurnoutScore(avgMetrics);

        // Calculate penalties for missed days
        const streak = await db('health_streaks').where({ user_id: userId }).first();
        let streakDays = streak?.current_streak || 0;
        let totalXp = streak?.total_xp || 0;
        const lastLoggedDate = streak?.last_logged_date || null;

        const { penaltyXp, brokenStreak } = await import('../utils/healthRules').then(m => m.calculatePenalties(lastLoggedDate));

        // Apply penalties if needed
        if (penaltyXp > 0 || brokenStreak) {
            streakDays = brokenStreak ? 0 : streakDays;
            totalXp = Math.max(0, totalXp - penaltyXp); // Ensure XP doesn't go negative

            // Update DB with penalties
            if (streak) {
                await db('health_streaks')
                    .where({ user_id: userId })
                    .update({
                        current_streak: streakDays,
                        total_xp: totalXp
                    });
            }
        }

        // Check for achievements
        const achievements = checkAchievements(recentEntries, streakDays);

        // Award achievement XP
        if (achievements.length > 0) {
            const newAchievements = [];
            for (const achievement of achievements) {
                // Check if already unlocked
                const existing = await db('health_achievements')
                    .where({ user_id: userId, achievement_key: achievement.key })
                    .first();

                if (!existing) {
                    await db('health_achievements').insert({
                        id: crypto.randomUUID(),
                        user_id: userId,
                        achievement_key: achievement.key,
                        xp_earned: achievement.xp
                    });

                    // Add XP to streak
                    if (streak) {
                        totalXp += achievement.xp;
                        await db('health_streaks')
                            .where({ user_id: userId })
                            .update({ total_xp: totalXp });
                    }

                    newAchievements.push(achievement);
                }
            }
        }

        // Calculate level
        const levelInfo = calculateLevel(totalXp);

        // Update current level in DB for record keeping
        if (streak && streak.current_level !== levelInfo.level) {
            await db('health_streaks')
                .where({ user_id: userId })
                .update({ current_level: levelInfo.level });
        }

        res.json({
            ...burnoutResult,
            streak_days: streakDays,
            achievements: achievements.map(a => ({ key: a.key, name: a.name, xp: a.xp })),
            level: levelInfo,
            total_xp: totalXp,
            penalties: {
                xp_lost: penaltyXp,
                streak_broken: brokenStreak
            }
        });
    } catch (error) {
        console.error('Burnout score error:', error);
        res.status(500).json({ error: 'Failed to calculate burnout score' });
    }
});

export default router;

import express from 'express';
import db from '../db';
import crypto from 'crypto';
import { format, startOfWeek, endOfWeek, getDay, subDays, eachDayOfInterval, parseISO } from 'date-fns';

const router = express.Router();

// --- Systems ---
router.get('/systems', async (req: any, res) => {
    try {
        const systems = await db('focus_systems')
            .where({ user_id: req.user?.id })
            .select('*');
        res.json(systems);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch systems' });
    }
});

router.post('/systems', async (req: any, res) => {
    try {
        const id = crypto.randomUUID();
        const systemData = {
            id,
            user_id: req.user?.id,
            ...req.body,
            scheduled_days: JSON.stringify(req.body.scheduled_days || []),
            identity_shift_id: req.body.identity_shift_id || null,
            project_id: req.body.project_id || null
        };

        await db('focus_systems').insert(systemData);

        const system = await db('focus_systems').where({ id }).first();
        res.status(201).json(system);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create system' });
    }
});

router.put('/systems/:id', async (req: any, res) => {
    try {
        const updateData = { ...req.body };
        if (updateData.scheduled_days) {
            updateData.scheduled_days = JSON.stringify(updateData.scheduled_days);
        }
        await db('focus_systems')
            .where({ id: req.params.id, user_id: req.user?.id })
            .update({
                ...updateData,
                identity_shift_id: updateData.identity_shift_id || null,
                project_id: updateData.project_id || null
            });
        const system = await db('focus_systems').where({ id: req.params.id }).first();
        res.json(system);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update system' });
    }
});

// --- Roadmap ---
router.get('/roadmap/status', async (req: any, res) => {
    try {
        const userId = req.user?.id;
        const year = parseInt(req.query.year as string) || new Date().getFullYear();

        // Fetch configs for the year
        const configs = await db('monthly_roadmap_configs')
            .where({ user_id: userId, year })
            .select('*');

        // Fetch achievements
        const achievements = await db('monthly_achievements')
            .where({ user_id: userId, year })
            .select('*');

        // Fetch logs for the whole year to calculate rough completion
        // In a real app, we'd cache these monthly summaries
        const logs = await db('daily_logs')
            .where({ user_id: userId })
            .where('date', '>=', `${year}-01-01`)
            .where('date', '<=', `${year}-12-31`)
            .select('date', 'completed', 'habit_id');

        const monthlyStatus = Array.from({ length: 12 }, (_, i) => {
            const month = i + 1;
            const monthPrefix = `${year}-${month.toString().padStart(2, '0')}`;
            const monthLogs = logs.filter(l => l.date.startsWith(monthPrefix));

            const habitLogs = monthLogs.filter(l => l.habit_id);
            const completionRate = habitLogs.length > 0
                ? (habitLogs.filter(l => l.completed).length / habitLogs.length) * 100
                : 0;

            const config = configs.find(c => c.month === month);
            const achievement = achievements.find(a => a.month === month);

            return {
                month,
                completion_rate: Math.round(completionRate),
                is_completed: !!achievement,
                has_config: !!config,
                achievement
            };
        });

        res.json(monthlyStatus);
    } catch (error) {
        console.error('Roadmap status error:', error);
        res.status(500).json({ error: 'Failed to fetch roadmap status' });
    }
});

router.get('/roadmap/monthly/:year/:month', async (req: any, res) => {
    try {
        const userId = req.user?.id;
        const { year, month } = req.params;
        const monthStr = month.toString().padStart(2, '0');
        const monthPrefix = `${year}-${monthStr}`;

        const config = await db('monthly_roadmap_configs')
            .where({ user_id: userId, year, month })
            .first();

        const logs = await db('daily_logs')
            .where({ user_id: userId })
            .where('date', 'like', `${monthPrefix}%`)
            .select('*');

        const healthEntries = await db('health_entries')
            .where({ user_id: userId })
            .where('date', 'like', `${monthPrefix}%`)
            .select('*');

        // Aggregations
        const habitIds = [...new Set(logs.filter(l => l.habit_id).map(l => l.habit_id))];
        const habits = await db('habits').whereIn('id', habitIds);

        const habitStats = habits.map(h => {
            const hLogs = logs.filter(l => l.habit_id === h.id);
            const completed = hLogs.filter(l => l.completed).length;
            return {
                name: h.name,
                completion: hLogs.length > 0 ? (completed / hLogs.length) * 100 : 0,
                total: hLogs.length
            };
        });

        const avgHealth = {
            mood: healthEntries.reduce((acc, e) => acc + (e.mood || 0), 0) / (healthEntries.length || 1),
            sleep: healthEntries.reduce((acc, e) => acc + (e.sleep_hours || 0), 0) / (healthEntries.length || 1),
            stress: healthEntries.reduce((acc, e) => acc + (e.stress || 0), 0) / (healthEntries.length || 1)
        };

        res.json({
            config: config ? {
                ...config,
                checklist_requirements: JSON.parse(config.checklist_requirements || '[]'),
                mvl_tiers: JSON.parse(config.mvl_tiers || '{}')
            } : null,
            habitStats,
            avgHealth,
            logCount: logs.length
        });
    } catch (error) {
        console.error('Monthly roadmap error:', error);
        res.status(500).json({ error: 'Failed to fetch monthly roadmap detail' });
    }
});

router.post('/roadmap/config', async (req: any, res) => {
    try {
        const userId = req.user?.id;
        const { year, month, checklist_requirements, mvl_tiers } = req.body;

        const configData = {
            user_id: userId,
            year,
            month,
            checklist_requirements: JSON.stringify(checklist_requirements || []),
            mvl_tiers: JSON.stringify(mvl_tiers || {})
        };

        const existing = await db('monthly_roadmap_configs')
            .where({ user_id: userId, year, month })
            .first();

        if (existing) {
            await db('monthly_roadmap_configs')
                .where({ id: existing.id })
                .update({ ...configData, updated_at: db.fn.now() });
        } else {
            await db('monthly_roadmap_configs').insert({
                id: crypto.randomUUID(),
                ...configData
            });
        }

        const config = await db('monthly_roadmap_configs')
            .where({ user_id: userId, year, month })
            .first();

        res.json({
            ...config,
            checklist_requirements: JSON.parse(config.checklist_requirements || '[]'),
            mvl_tiers: JSON.parse(config.mvl_tiers || '{}')
        });
    } catch (error) {
        console.error('Roadmap config error:', error);
        res.status(500).json({ error: 'Failed to save roadmap config' });
    }
});

router.delete('/systems/:id', async (req: any, res) => {
    try {
        await db('focus_systems')
            .where({ id: req.params.id, user_id: req.user?.id })
            .delete();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete system' });
    }
});

// --- Daily Logs ---
router.get('/logs', async (req: any, res) => {
    try {
        const { date, system_id } = req.query;
        let query = db('daily_logs').where({ user_id: req.user?.id });
        if (date) query = query.where({ date });
        if (system_id) query = query.where({ system_id });
        const logs = await query.select('*');
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

import { calculateXPEarned, updateStreak, checkAchievements } from '../services/gamification';

async function updateDaySummary(userId: string, date: string, trx?: any) {
    const q = trx || db;
    try {
        const parsedDate = parseISO(date);
        const dayOfWeek = getDay(parsedDate);

        // 1. Calculate scheduled habits for this specific day
        const habits = await q('habits').where({ user_id: userId, is_active: true });
        const scheduledHabits = habits.filter((h: any) => {
            if (!h.days_of_week) return true;
            try {
                const days = typeof h.days_of_week === 'string' ? JSON.parse(h.days_of_week) : h.days_of_week;
                return Array.isArray(days) && days.includes(dayOfWeek);
            } catch (e) {
                return true; // Default to scheduled if parse fails
            }
        });

        // 2. Calculate completed habits from logs for today
        const scheduledHabitIds = scheduledHabits.map((h: any) => h.id);
        const logs = await q('daily_logs')
            .where({ user_id: userId, date, completed: true })
            .whereIn('habit_id', scheduledHabitIds);

        const xpSum = await q('daily_logs')
            .where({ user_id: userId, date })
            .sum('xp_earned as totalXP')
            .first();

        const qualityAvg = await q('daily_logs')
            .where({ user_id: userId, date })
            .whereNotNull('quality_rating')
            .avg('quality_rating as avgQuality')
            .first();

        const latestNote = await q('daily_logs')
            .where({ user_id: userId, date })
            .whereNotNull('notes')
            .whereNot('notes', '')
            .orderBy('created_at', 'desc')
            .first();

        const summaryData = {
            id: crypto.randomUUID(),
            user_id: userId,
            date,
            habits_scheduled: scheduledHabits.length,
            habits_completed: logs.length,
            completion_rate: scheduledHabits.length > 0 ? logs.length / scheduledHabits.length : 0,
            xp_earned: Number(xpSum?.totalXP || 0),
            average_habit_quality: qualityAvg?.avgQuality ? Math.round(Number(qualityAvg.avgQuality)) : null,
            notes: latestNote?.notes || null
        };

        await q('day_summaries')
            .insert(summaryData)
            .onConflict(['user_id', 'date'])
            .merge();

        return summaryData;
    } catch (error) {
        console.error('Failed to update day summary:', error);
        throw error;
    }
}

// --- Batch Logging (Used by Daily Alignment Modal) ---
router.post('/logs/batch', async (req: any, res) => {
    const trx = await db.transaction();
    try {
        const { date, mood, energy_level, notes, logs: items } = req.body;
        const userId = req.user?.id;
        const results = [];

        for (const item of items) {
            const { system_id, habit_id, completed, effort_level, used_easy_variant } = item;

            // 1. Calculate gamification data BEFORE insert to avoid ID mismatch on merge
            let xp_earned = 0;
            if (completed) {
                const xpResult = await calculateXPEarned(userId, system_id, effort_level || 3, habit_id, undefined, trx);
                xp_earned = xpResult.totalXP;
                const streakResult = await updateStreak(userId, system_id, date, habit_id, undefined, trx);
                results.push({ system_id, habit_id, xp: xp_earned, streak: streakResult });
            }

            const logData = {
                id: crypto.randomUUID(),
                user_id: userId,
                system_id,
                habit_id: habit_id || null,
                date,
                completed,
                effort_level: effort_level || 3,
                mood: mood || 'good',
                energy_level: energy_level || 3,
                notes: notes || '',
                used_easy_variant: !!used_easy_variant,
                xp_earned
            };

            if (habit_id) {
                // For habits, we use (user_id, habit_id, date)
                const existing = await trx('daily_logs')
                    .where({ user_id: userId, habit_id, date })
                    .first();

                if (existing) {
                    await trx('daily_logs')
                        .where({ id: existing.id })
                        .update({ completed, effort_level: effort_level || 3, mood: mood || 'good', energy_level: energy_level || 3, notes: notes || '', used_easy_variant: !!used_easy_variant, xp_earned });
                } else {
                    await trx('daily_logs').insert(logData);
                }
            } else {
                // For direct system logs (where habit_id is null), use the partial unique index logic
                const existing = await trx('daily_logs')
                    .where({ user_id: userId, system_id, date })
                    .whereNull('habit_id')
                    .first();

                if (existing) {
                    await trx('daily_logs')
                        .where({ id: existing.id })
                        .update({ completed, effort_level: effort_level || 3, mood: mood || 'good', energy_level: energy_level || 3, notes: notes || '', used_easy_variant: !!used_easy_variant, xp_earned });
                } else {
                    await trx('daily_logs').insert(logData);
                }
            }

            // 2. Auto-complete habits for primary system log
            if (!habit_id && system_id && completed) {
                const nestedHabits = await trx('habits').where({ system_id, user_id: userId, is_active: true });
                for (const habit of nestedHabits) {
                    // Calculate XP and update streak for EACH nested habit
                    const habitXP = await calculateXPEarned(userId, system_id, effort_level || 3, habit.id, undefined, trx);
                    await updateStreak(userId, system_id, date, habit.id, undefined, trx);

                    const existingHabitLog = await trx('daily_logs')
                        .where({ user_id: userId, habit_id: habit.id, date })
                        .first();

                    if (existingHabitLog) {
                        await trx('daily_logs')
                            .where({ id: existingHabitLog.id })
                            .update({ completed: true, effort_level: effort_level || 3, mood: mood || 'good', energy_level: energy_level || 3, used_easy_variant: !!used_easy_variant, xp_earned: habitXP.totalXP });
                    } else {
                        await trx('daily_logs').insert({
                            id: crypto.randomUUID(),
                            user_id: userId,
                            system_id,
                            habit_id: habit.id,
                            date,
                            completed: true,
                            effort_level: effort_level || 3,
                            mood: mood || 'good',
                            energy_level: energy_level || 3,
                            used_easy_variant: !!used_easy_variant,
                            xp_earned: habitXP.totalXP
                        });
                    }
                }
            }

            // 3. Update Identity XP if applicable
            if (completed && xp_earned > 0) {
                const system = await trx('focus_systems').where({ id: system_id }).first();
                if (system?.identity_id) {
                    await trx('identities')
                        .where({ id: system.identity_id })
                        .increment('xp', xp_earned);
                }
            }
        }

        // 4. Update Day Summary within same transaction to ensure consistency
        const summary = await updateDaySummary(userId, date, trx);

        // 5. Also update health_entries if they exist or create one
        await trx('health_entries')
            .insert({
                id: crypto.randomUUID(),
                user_id: userId,
                date,
                mood: mood === 'great' ? 10 : mood === 'good' ? 8 : mood === 'neutral' ? 5 : 3,
                stress: 5, // Default
                sleep_hours: 8 // Default
            })
            .onConflict(['user_id', 'date'])
            .merge(['mood']); // Only merge mood from this log

        await trx.commit();
        res.status(201).json({ success: true, summary, results });
    } catch (error) {
        await trx.rollback();
        console.error('Batch logging error:', error);
        res.status(500).json({ error: 'Failed to process batch logs' });
    }
});

router.post('/logs', async (req: any, res) => {
    try {
        const { system_id, habit_id, date, completed, effort_level, used_easy_variant } = req.body;
        const userId = req.user?.id;

        let xp_earned = 0;
        if (completed) {
            const xpResult = await calculateXPEarned(userId, system_id, effort_level || 3, habit_id);
            xp_earned = xpResult.totalXP;
            await updateStreak(userId, system_id, date, habit_id);
        }

        const logData = {
            id: crypto.randomUUID(),
            user_id: userId,
            system_id,
            habit_id: habit_id || null,
            date,
            completed,
            effort_level: effort_level || 3,
            mood: req.body.mood || 'good',
            energy_level: req.body.energy_level || 3,
            notes: req.body.notes || '',
            used_easy_variant: !!used_easy_variant,
            xp_earned
        };

        if (habit_id) {
            const existing = await db('daily_logs')
                .where({ user_id: userId, habit_id, date })
                .first();

            if (existing) {
                await db('daily_logs')
                    .where({ id: existing.id })
                    .update({ completed, effort_level: effort_level || 3, mood: req.body.mood || 'good', energy_level: req.body.energy_level || 3, notes: req.body.notes || '', used_easy_variant: !!used_easy_variant, xp_earned });
            } else {
                await db('daily_logs').insert(logData);
            }
        } else {
            const existing = await db('daily_logs')
                .where({ user_id: userId, system_id, date })
                .whereNull('habit_id')
                .first();

            if (existing) {
                await db('daily_logs')
                    .where({ id: existing.id })
                    .update({ completed, effort_level: effort_level || 3, mood: req.body.mood || 'good', energy_level: req.body.energy_level || 3, notes: req.body.notes || '', used_easy_variant: !!used_easy_variant, xp_earned });
            } else {
                await db('daily_logs').insert(logData);
            }
        }

        if (!habit_id && system_id && completed) {
            const habits = await db('habits').where({ system_id, user_id: userId, is_active: true });
            for (const habit of habits) {
                const habitXP = await calculateXPEarned(userId, system_id, effort_level || 3, habit.id);
                await updateStreak(userId, system_id, date, habit.id);

                const existingHabitLog = await db('daily_logs')
                    .where({ user_id: userId, habit_id: habit.id, date })
                    .first();

                if (existingHabitLog) {
                    await db('daily_logs')
                        .where({ id: existingHabitLog.id })
                        .update({ completed: true, effort_level: effort_level || 3, mood: req.body.mood || 'good', energy_level: req.body.energy_level || 3, used_easy_variant: !!used_easy_variant, xp_earned: habitXP.totalXP });
                } else {
                    await db('daily_logs').insert({
                        id: crypto.randomUUID(),
                        user_id: userId,
                        system_id,
                        habit_id: habit.id,
                        date,
                        completed: true,
                        effort_level: effort_level || 3,
                        mood: req.body.mood || 'good',
                        energy_level: req.body.energy_level || 3,
                        used_easy_variant: !!used_easy_variant,
                        xp_earned: habitXP.totalXP
                    });
                }
            }
        }

        if (completed && xp_earned > 0) {
            const system = await db('focus_systems').where({ id: system_id }).first();
            if (system?.identity_id) {
                await db('identities').where({ id: system.identity_id }).increment('xp', xp_earned);
            }
        }

        await updateDaySummary(userId, date);
        res.status(201).json({ success: true });
    } catch (error) {
        console.error('Logging error:', error);
        res.status(500).json({ error: 'Failed to log activity' });
    }
});

import { calculateBurnoutScore } from '../services/burnout';

// --- Burnout & Analytics (Stub/Initial) ---
router.get('/burnout/score', async (req: any, res) => {
    try {
        const result = await calculateBurnoutScore(req.user?.id);
        res.json(result);
    } catch (error) {
        console.error('Burnout calc error:', error);
        res.status(500).json({ error: 'Failed to calculate burnout score' });
    }
});

// --- Identities & Shifts ---
router.get('/identities', async (req: any, res) => {
    try {
        const identities = await db('quarterly_identity_shifts')
            .where({ user_id: req.user?.id })
            .orderBy('created_at', 'desc');
        res.json(identities);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch identities' });
    }
});

router.post('/identities', async (req: any, res) => {
    try {
        const { primary_identity, vision_statement, ten_year_vision, goals, quarter, year } = req.body;
        const [id] = await db('quarterly_identity_shifts').insert({
            user_id: req.user?.id,
            primary_identity,
            vision_statement,
            ten_year_vision,
            goals,
            quarter,
            year
        });
        res.json({ id });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create identity shift' });
    }
});

// --- Weekly Reviews ---
router.post('/reviews', async (req: any, res) => {
    try {
        const { wins, bottlenecks, adjustments, value_alignment_score } = req.body;
        const [id] = await db('weekly_reviews').insert({
            user_id: req.user?.id,
            start_date: format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
            end_date: format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
            wins,
            bottlenecks,
            adjustments,
            value_alignment_score: value_alignment_score || 3
        });
        res.json({ id });
    } catch (error) {
        console.error('Review save error:', error);
        res.status(500).json({ error: 'Failed to save weekly review' });
    }
});

// --- Habits ---
router.get('/habits', async (req: any, res) => {
    try {
        const { system_id } = req.query;
        let query = db('habits').where({ user_id: req.user?.id });
        if (system_id) query = query.where({ system_id });
        const habits = await query.orderBy('order', 'asc').select('*');

        const habitIds = habits.map((h: any) => h.id);

        // 1. Fetch completed dates from daily_logs
        const logs = await db('daily_logs')
            .whereIn('habit_id', habitIds)
            .where({ user_id: req.user?.id, completed: true })
            .select('habit_id', 'date');

        // 2. Fetch streaks
        const streaks = await db('streaks')
            .whereIn('habit_id', habitIds)
            .where({ user_id: req.user?.id });

        const habitsWithStats = habits.map((h: any) => ({
            ...h,
            completed_dates: logs.filter((l: any) => l.habit_id === h.id).map((l: any) => l.date),
            streak: streaks.find(s => s.habit_id === h.id)?.current_streak || 0
        }));

        res.json(habitsWithStats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch habits' });
    }
});

router.post('/habits', async (req: any, res) => {
    try {
        const id = crypto.randomUUID();
        const habitData = {
            id,
            user_id: req.user?.id,
            ...req.body,
            days_of_week: req.body.days_of_week ? JSON.stringify(req.body.days_of_week) : JSON.stringify([0, 1, 2, 3, 4, 5, 6])
        };
        await db('habits').insert(habitData);
        const habit = await db('habits').where({ id }).first();
        res.status(201).json(habit);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create habit' });
    }
});

router.put('/habits/:id', async (req: any, res) => {
    try {
        const updates = { ...req.body };
        if (updates.days_of_week) {
            updates.days_of_week = JSON.stringify(updates.days_of_week);
        }
        await db('habits')
            .where({ id: req.params.id, user_id: req.user?.id })
            .update(updates);
        const habit = await db('habits').where({ id: req.params.id }).first();
        res.json(habit);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update habit' });
    }
});

router.delete('/habits/:id', async (req: any, res) => {
    try {
        await db('habits')
            .where({ id: req.params.id, user_id: req.user?.id })
            .delete();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete habit' });
    }
});

router.get('/stats/habits/overview', async (req: any, res) => {
    try {
        const { period } = req.query; // year, quarter, month, week
        const userId = req.user?.id;

        let days = 7;
        if (period === 'month') days = 30;
        if (period === 'quarter') days = 90;
        if (period === 'year') days = 365;

        const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');

        const stats = await db('day_summaries')
            .where({ user_id: userId })
            .where('date', '>=', startDate)
            .orderBy('date', 'asc');

        // Overall metrics
        const totals = stats.reduce((acc, curr) => ({
            xp: acc.xp + curr.xp_earned,
            scheduled: acc.scheduled + curr.habits_scheduled,
            completed: acc.completed + curr.habits_completed
        }), { xp: 0, scheduled: 0, completed: 0 });

        const avgAdherence = totals.scheduled > 0 ? (totals.completed / totals.scheduled) * 100 : 0;

        res.json({
            stats,
            summary: {
                totalXP: totals.xp,
                avgAdherence: Math.round(avgAdherence),
                daysTracked: stats.length
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch habit stats' });
    }
});

router.get('/stats/habits/breakdown', async (req: any, res) => {
    try {
        const { period } = req.query; // year, quarter, month, week
        const userId = req.user?.id;

        let days = 30;
        if (period === 'week') days = 7;
        if (period === 'quarter') days = 90;
        if (period === 'year') days = 365;

        const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
        const endDate = format(new Date(), 'yyyy-MM-dd');

        // 1. Get all active habits
        const habits = await db('habits').where({ user_id: userId, is_active: true });

        // 2. Get all logs for the period
        const logs = await db('daily_logs')
            .where({ user_id: userId })
            .where('date', '>=', startDate)
            .where('date', '<=', endDate)
            .whereNotNull('habit_id');

        // 3. Calculate stats per habit
        const breakdown = habits.map(habit => {
            let scheduledCount = 0;
            let completedCount = 0;

            // Determine scheduled days (0-6)
            let scheduledDays = [0, 1, 2, 3, 4, 5, 6];
            try {
                if (habit.days_of_week) {
                    scheduledDays = typeof habit.days_of_week === 'string'
                        ? JSON.parse(habit.days_of_week)
                        : habit.days_of_week;
                }
            } catch (e) { }

            // Iterate through every day in the period to check schedule
            const interval = eachDayOfInterval({
                start: new Date(startDate),
                end: new Date(endDate)
            });

            interval.forEach(day => {
                const dayOfWeek = getDay(day);
                if (scheduledDays.includes(dayOfWeek)) {
                    scheduledCount++;
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const log = logs.find((l: any) => l.habit_id === habit.id && l.date === dateStr);
                    if (log && log.completed) {
                        completedCount++;
                    }
                }
            });

            const adherence = scheduledCount > 0 ? (completedCount / scheduledCount) * 100 : 0;

            return {
                id: habit.id,
                name: habit.name,
                system_id: habit.system_id,
                adherence: Math.round(adherence),
                completed: completedCount,
                scheduled: scheduledCount
            };
        });

        // Sort by adherence descending
        breakdown.sort((a, b) => b.adherence - a.adherence);

        res.json(breakdown);
    } catch (error) {
        console.error('Breakdown error:', error);
        res.status(500).json({ error: 'Failed to fetch habit breakdown' });
    }
});

router.get('/habits/:id/analytics', async (req: any, res) => {
    try {
        const habitId = req.params.id;
        const logs = await db('daily_logs')
            .where({ habit_id: habitId, user_id: req.user?.id })
            .orderBy('date', 'asc')
            .limit(90);

        const streak = await db('streaks')
            .where({ habit_id: habitId, user_id: req.user?.id })
            .first();

        // Calculate adherence
        const totalLogs = logs.length;
        const fulfilledLogs = logs.filter(l => l.completed).length;
        const adherence = totalLogs > 0 ? (fulfilledLogs / totalLogs) * 100 : 0;

        res.json({
            history: logs,
            streak: streak?.current_streak || 0,
            bestStreak: streak?.best_streak || 0,
            adherence: Math.round(adherence),
            daysMissed: totalLogs - fulfilledLogs,
            daysFulfilled: fulfilledLogs
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch habit analytics' });
    }
});

// --- Projects ---
router.get('/projects', async (req: any, res) => {
    try {
        const { lifeAreaId } = req.query;
        let query = db('projects').where({ user_id: req.user?.id });
        if (lifeAreaId) query = query.where({ life_area_id: lifeAreaId });
        const projects = await query.select('*');
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

router.post('/projects', async (req: any, res) => {
    try {
        const id = crypto.randomUUID();
        const data = { id, user_id: req.user?.id, ...req.body };
        await db('projects').insert(data);
        const project = await db('projects').where({ id }).first();
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create project' });
    }
});

// --- Artifacts Generic (Books, Notes, Reviews) ---
const ARTIFACT_TABLES: Record<string, string> = {
    'books': 'books',
    'notes': 'notes',
    'reviews': 'reviews_v2'
};

router.get('/artifacts/:type', async (req: any, res) => {
    try {
        const table = ARTIFACT_TABLES[req.params.type];
        if (!table) return res.status(400).json({ error: 'Invalid artifact type' });
        const { lifeAreaId } = req.query;
        let query = db(table).where({ user_id: req.user?.id });
        if (lifeAreaId) query = query.where({ life_area_id: lifeAreaId });
        const artifacts = await query.select('*');
        res.json(artifacts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch artifacts' });
    }
});

router.post('/artifacts/:type', async (req: any, res) => {
    try {
        const table = ARTIFACT_TABLES[req.params.type];
        if (!table) return res.status(400).json({ error: 'Invalid artifact type' });
        const id = crypto.randomUUID();
        const data = { id, user_id: req.user?.id, ...req.body };
        await db(table).insert(data);
        const artifact = await db(table).where({ id }).first();
        res.status(201).json(artifact);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create artifact' });
    }
});

// --- Stats Overview (Pie Chart Data) ---
router.get('/stats/areas/overview', async (req: any, res) => {
    try {
        const userId = req.user?.id;
        const areas = await db('life_areas').where({ user_id: userId });

        const areaStats = await Promise.all(areas.map(async (area) => {
            const habits = await db('habits').where({ area_id: area.id, user_id: userId });
            const logs = await db('daily_logs')
                .where({ user_id: userId })
                .whereIn('habit_id', habits.map(h => h.id));

            const completionRate = habits.length > 0
                ? (logs.filter(l => l.completed).length / (habits.length * 30)) // Rough month adherence
                : 0;

            const activeSystems = await db('focus_systems').where({ life_area_id: area.id, user_id: userId }).count('id as count');
            const openProjects = await db('projects').where({ life_area_id: area.id, user_id: userId, status: 'active' }).count('id as count');

            return {
                ...area,
                completion_rate: Math.min(completionRate, 1),
                active_systems: activeSystems[0].count,
                open_projects: openProjects[0].count
            };
        }));

        res.json(areaStats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch area stats' });
    }
});

export default router;

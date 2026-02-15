import express from 'express';
import db from '../db';
import { format, subDays, subWeeks, subMonths, subYears, startOfDay } from 'date-fns';

const router = express.Router();

const authenticateToken = (req: any, res: any, next: any) => next();

// GET variance analytics for a specific metric in an area
router.get('/variance/:areaId', authenticateToken, async (req: any, res) => {
    try {
        const { areaId } = req.params;
        const { period = 'month', metric } = req.query;
        const userId = req.user.id;

        // Determine date range based on period
        let startDate: Date;
        const endDate = new Date();

        switch (period) {
            case 'week':
                startDate = subWeeks(endDate, 1);
                break;
            case 'month':
                startDate = subMonths(endDate, 1);
                break;
            case 'year':
                startDate = subYears(endDate, 1);
                break;
            default:
                startDate = subMonths(endDate, 1);
        }

        const startDateStr = format(startDate, 'yyyy-MM-dd');
        const endDateStr = format(endDate, 'yyyy-MM-dd');

        // Get area to determine which metrics to query
        const area = await db('life_areas').where({ id: areaId, user_id: userId }).first();
        if (!area) {
            return res.status(404).json({ error: 'Area not found' });
        }

        let timeSeries: any[] = [];
        let statistics: any = {};
        let optimal: any = {};

        // Health area metrics
        if (area.name.toLowerCase() === 'health') {
            const entries = await db('health_entries')
                .where({ user_id: userId })
                .whereBetween('date', [startDateStr, endDateStr])
                .orderBy('date', 'asc');

            const metricMap: Record<string, { field: string; optimal: any }> = {
                sleep: {
                    field: 'sleep_hours',
                    optimal: { min: 7, max: 9, target: 8 }
                },
                mood: {
                    field: 'mood',
                    optimal: { min: 7, max: 10, target: 8 }
                },
                stress: {
                    field: 'stress',
                    optimal: { min: 1, max: 3, target: 2 }
                },
                exercise: {
                    field: 'exercise_minutes',
                    optimal: { min: 30, max: 60, target: 45 }
                },
                screen: {
                    field: 'screen_time_hours',
                    optimal: { min: 0, max: 8, target: 4 }
                }
            };

            const metricConfig = metricMap[metric as string];
            if (!metricConfig) {
                return res.status(400).json({ error: 'Invalid metric for health area' });
            }

            optimal = metricConfig.optimal;

            // Get all historical data for personal best/low
            const allEntries = await db('health_entries')
                .where({ user_id: userId })
                .select(metricConfig.field as string)
                .whereNotNull(metricConfig.field);

            const values = allEntries.map((e: any) => e[metricConfig.field]).filter((v: any) => v != null);
            const personalBest = values.length > 0 ? Math.max(...values) : 0;
            const personalLow = values.length > 0 ? Math.min(...values) : 0;

            // Build time series
            timeSeries = entries.map((entry: any) => ({
                date: entry.date,
                value: entry[metricConfig.field] || 0,
                personalBest,
                personalLow
            }));

            // Calculate statistics
            const currentValues = entries.map((e: any) => e[metricConfig.field] || 0);
            const currentAvg = currentValues.length > 0
                ? currentValues.reduce((a: number, b: number) => a + b, 0) / currentValues.length
                : 0;

            const variance = currentValues.length > 0
                ? currentValues.reduce((sum: number, val: number) => sum + Math.pow(val - currentAvg, 2), 0) / currentValues.length
                : 0;

            statistics = {
                currentAvg: Math.round(currentAvg * 10) / 10,
                bestEver: personalBest,
                lowestEver: personalLow,
                variance: Math.round(variance * 100) / 100
            };
        }
        // Work/Business area metrics
        else if (area.name.toLowerCase() === 'work' || area.name.toLowerCase() === 'business') {
            if (metric === 'tasksCompleted') {
                // Query tasks completed per day
                const tasks = await db('tasks')
                    .where({ user_id: userId, area_id: areaId })
                    .whereBetween('completed_at', [startDateStr, endDateStr])
                    .whereNotNull('completed_at')
                    .select('completed_at');

                optimal = { min: 5, max: 8, target: 6 };

                // Group by date
                const tasksByDate: Record<string, number> = {};
                tasks.forEach((task: any) => {
                    const date = format(new Date(task.completed_at), 'yyyy-MM-dd');
                    tasksByDate[date] = (tasksByDate[date] || 0) + 1;
                });

                // Get all historical data
                const allTasks = await db('tasks')
                    .where({ user_id: userId, area_id: areaId })
                    .whereNotNull('completed_at')
                    .select('completed_at');

                const allTasksByDate: Record<string, number> = {};
                allTasks.forEach((task: any) => {
                    const date = format(new Date(task.completed_at), 'yyyy-MM-dd');
                    allTasksByDate[date] = (allTasksByDate[date] || 0) + 1;
                });

                const allCounts = Object.values(allTasksByDate);
                const personalBest = allCounts.length > 0 ? Math.max(...allCounts) : 0;
                const personalLow = allCounts.length > 0 ? Math.min(...allCounts) : 0;

                // Build time series
                const dates = [];
                for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                    const dateStr = format(d, 'yyyy-MM-dd');
                    dates.push({
                        date: dateStr,
                        value: tasksByDate[dateStr] || 0,
                        personalBest,
                        personalLow
                    });
                }
                timeSeries = dates;

                const values = Object.values(tasksByDate);
                const currentAvg = values.length > 0
                    ? values.reduce((a, b) => a + b, 0) / values.length
                    : 0;

                statistics = {
                    currentAvg: Math.round(currentAvg * 10) / 10,
                    bestEver: personalBest,
                    lowestEver: personalLow,
                    variance: 0
                };
            }
        }

        res.json({
            metric,
            optimal,
            timeSeries,
            statistics
        });
    } catch (error) {
        console.error('Analytics variance error:', error);
        res.status(500).json({ error: 'Failed to fetch variance analytics' });
    }
});

export default router;

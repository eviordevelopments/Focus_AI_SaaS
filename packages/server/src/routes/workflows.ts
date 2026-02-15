import express from 'express';
import db from '../db';
import crypto from 'crypto';
import { calculateXPEarned, updateStreak, checkAchievements } from '../services/gamification';
import { format, getHours } from 'date-fns';

const router = express.Router();

// --- Workflows ---

// List all workflows
router.get('/', async (req: any, res) => {
    try {
        const workflows = await db('workflows')
            .where({ user_id: req.user?.id })
            .select('*');

        // Fetch steps for each workflow
        const workflowsWithSteps = await Promise.all(workflows.map(async (w) => {
            const steps = await db('workflow_steps')
                .where({ workflow_id: w.id })
                .orderBy('order', 'asc');
            return { ...w, steps: steps.map(s => ({ ...s, config: typeof s.config === 'string' ? JSON.parse(s.config) : s.config })) };
        }));

        res.json(workflowsWithSteps);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch workflows' });
    }
});

// Create workflow
router.post('/', async (req: any, res) => {
    try {
        const id = crypto.randomUUID();
        const { name, emoji, color, description, tags, type, life_area_id, system_id, project_id, steps } = req.body;

        await db('workflows').insert({
            id,
            user_id: req.user?.id,
            name,
            emoji,
            color,
            description,
            tags: JSON.stringify(tags || []),
            type: type || 'manual',
            status: 'active',
            life_area_id,
            system_id: system_id || null,
            project_id: project_id || null
        });

        // Insert steps if provided
        if (steps && Array.isArray(steps)) {
            const stepInserts = steps.map((step, index) => ({
                id: crypto.randomUUID(),
                workflow_id: id,
                order: index,
                step_type: step.step_type,
                config: JSON.stringify(step.config || {})
            }));
            await db('workflow_steps').insert(stepInserts);
        }

        const workflow = await db('workflows').where({ id }).first();
        res.status(201).json(workflow);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create workflow' });
    }
});

// Update workflow
router.put('/:id', async (req: any, res) => {
    try {
        const { id } = req.params;
        const { name, emoji, color, description, tags, type, status, life_area_id, system_id, project_id, steps } = req.body;

        await db('workflows')
            .where({ id, user_id: req.user?.id })
            .update({
                name,
                emoji,
                color,
                description,
                tags: tags ? JSON.stringify(tags) : undefined,
                type,
                status,
                life_area_id,
                system_id,
                project_id
            });

        // Update steps if provided
        if (steps && Array.isArray(steps)) {
            // Simple approach: delete and re-insert
            await db('workflow_steps').where({ workflow_id: id }).delete();
            const stepInserts = steps.map((step, index) => ({
                id: crypto.randomUUID(),
                workflow_id: id,
                order: index,
                step_type: step.step_type,
                config: JSON.stringify(step.config || {})
            }));
            if (stepInserts.length > 0) {
                await db('workflow_steps').insert(stepInserts);
            }
        }

        const workflow = await db('workflows').where({ id }).first();
        res.json(workflow);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update workflow' });
    }
});

// Delete workflow
router.delete('/:id', async (req: any, res) => {
    try {
        await db('workflows')
            .where({ id: req.params.id, user_id: req.user?.id })
            .delete();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete workflow' });
    }
});

// --- Execution ---

// Start workflow run
router.post('/:id/run', async (req: any, res) => {
    try {
        const runId = crypto.randomUUID();
        await db('workflow_runs').insert({
            id: runId,
            workflow_id: req.params.id,
            user_id: req.user?.id,
            status: 'running'
        });

        const run = await db('workflow_runs').where({ id: runId }).first();
        res.status(201).json(run);
    } catch (error) {
        res.status(500).json({ error: 'Failed to start workflow run' });
    }
});

// --- Suggestions & Discovery ---

// Get smart suggestions for the user
router.get('/suggestions', async (req: any, res) => {
    try {
        const userId = req.user?.id;
        const now = new Date();
        const currentHour = getHours(now);

        // 1. Get frequency distribution of workflows
        const pastRuns = await db('workflow_runs')
            .where({ user_id: userId, status: 'completed' })
            .select('workflow_id', 'start_time')
            .orderBy('start_time', 'desc')
            .limit(100);

        const frequencyMap: Record<string, { count: number, hourClusters: number[] }> = {};

        pastRuns.forEach(run => {
            const wId = run.workflow_id;
            const hour = getHours(new Date(run.start_time));
            if (!frequencyMap[wId]) {
                frequencyMap[wId] = { count: 0, hourClusters: [] };
            }
            frequencyMap[wId].count++;
            frequencyMap[wId].hourClusters.push(hour);
        });

        // 2. Score workflows based on current time matching and overall frequency
        const workflows = await db('workflows').where({ user_id: userId, status: 'active' });

        const scored = workflows.map(w => {
            const stats = frequencyMap[w.id] || { count: 0, hourClusters: [] };
            let score = stats.count * 10; // Base score on frequency

            // Time matching (+50 points if run within 2 hours of current time in the past)
            const matchesTime = stats.hourClusters.some(h => Math.abs(h - currentHour) <= 2);
            if (matchesTime) score += 50;

            // Recency boost (if run in last 48h, keeps it top of mind)
            const lastRun = pastRuns.find(r => r.workflow_id === w.id);
            if (lastRun && (now.getTime() - new Date(lastRun.start_time).getTime()) < 172800000) {
                score += 30;
            }

            return { ...w, suggestionScore: score };
        });

        const suggestions = scored
            .sort((a, b) => b.suggestionScore - a.suggestionScore)
            .slice(0, 3); // Top 3

        res.json(suggestions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch suggestions' });
    }
});

// Complete workflow run
router.post('/runs/:runId/complete', async (req: any, res) => {
    const trx = await db.transaction();
    try {
        const userId = req.user?.id;
        const { runId } = req.params;
        const { completed_steps } = req.body;

        const run = await trx('workflow_runs').where({ id: runId, user_id: userId }).first();
        if (!run) throw new Error('Run not found');

        const workflow = await trx('workflows').where({ id: run.workflow_id }).first();

        // 1. Update run status
        await trx('workflow_runs')
            .where({ id: runId })
            .update({
                status: 'completed',
                end_time: db.fn.now()
            });

        // 2. Handle Gamification
        const xpResult = await calculateXPEarned(userId, undefined, 3, undefined, workflow.id, trx);
        const streakResult = await updateStreak(userId, undefined, undefined, undefined, workflow.id, trx);
        const achievements = await checkAchievements(userId);

        // 3. Record session if it was a block
        if (workflow.type === 'block') {
            await trx('block_sessions').insert({
                id: crypto.randomUUID(),
                workflow_run_id: runId,
                date: format(new Date(), 'yyyy-MM-dd'),
                technique: 'manual',
                completed_steps: JSON.stringify(completed_steps || []),
                xp_earned: xpResult.totalXP
            });
        }

        // 4. Update Area/Identity XP
        if (workflow.life_area_id && xpResult.totalXP > 0) {
            const identity = await trx('identities')
                .where({ life_area_id: workflow.life_area_id, user_id: userId, is_active: true })
                .first();
            if (identity) {
                await trx('identities')
                    .where({ id: identity.id })
                    .increment('xp', xpResult.totalXP);
            }
        }

        // Add a log for the activity
        await trx('daily_logs').insert({
            id: crypto.randomUUID(),
            user_id: userId,
            date: format(new Date(), 'yyyy-MM-dd'),
            notes: `Completed protocol: ${workflow.name}`,
            completed: true,
            actual_duration_minutes: 0,
            xp_earned: xpResult.totalXP,
            timestamps: db.fn.now()
        });

        await trx.commit();
        res.json({
            message: 'Run completed',
            xp: xpResult.totalXP,
            streak: streakResult,
            achievements
        });
    } catch (error) {
        await trx.rollback();
        console.error(error);
        res.status(500).json({ error: 'Failed to complete workflow run' });
    }
});

export default router;

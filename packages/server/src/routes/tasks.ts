import express from 'express';
import db from '../db';

const router = express.Router();

// GET tasks with filters
router.get('/', async (req, res) => {
    try {
        const { area_id, status, due_date } = req.query;

        let query = db('tasks').select('*').orderBy('created_at', 'desc');

        if (area_id) {
            query = query.where('area_id', area_id as string);
        }
        if (status) {
            query = query.where('status', status as string);
        }
        // Simple date filter for MVP
        if (due_date) {
            // Implement date logic if needed, e.g. "today"
        }

        const tasks = await query;
        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// POST create task
router.post('/', async (req: any, res) => {
    const { title, description, status, priority, area_id, due_date, start_time, end_time, is_recurring, recurring_days, location, links, color, session_config } = req.body;

    try {
        const [newTask] = await db("tasks")
            .insert({
                user_id: req.user.id,
                title,
                description,
                status: status || "todo",
                priority: priority || 1,
                area_id,
                due_date,
                start_time,
                end_time,
                is_recurring: is_recurring || false,
                recurring_days,
                location,
                links,
                color,
                session_config
            })
            .returning("*");

        res.status(201).json(newTask);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// PUT update task
router.put("/:id", async (req: any, res) => {
    const { id } = req.params;
    const { title, description, status, priority, area_id, due_date, completed_at, start_time, end_time, is_recurring, recurring_days, location, links, color, session_config } = req.body;

    try {
        const [updatedTask] = await db("tasks")
            .where({ id, user_id: req.user.id })
            .update({
                title,
                description,
                status,
                priority,
                area_id,
                due_date,
                completed_at,
                start_time,
                end_time,
                is_recurring,
                recurring_days,
                location,
                links,
                color,
                session_config
            })
            .returning("*");

        if (!updatedTask) {
            return res.status(404).json({ error: "Task not found" });
        }

        res.json(updatedTask);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// DELETE task
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db('tasks').where('id', id).del();
        res.json({ message: 'Task deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

export default router;

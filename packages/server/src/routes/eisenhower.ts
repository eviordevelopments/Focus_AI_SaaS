import express from 'express';
import db from '../db';
import crypto from 'crypto';

const router = express.Router();

// GET snapshot by date (defaults to today)
router.get('/', async (req: any, res) => {
    try {
        const userId = req.user?.id;
        const date = (req.query.date as string) || new Date().toISOString().split('T')[0];

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        let snapshot = await db('eisenhower_snapshots')
            .where({ user_id: userId, date: date })
            .first();

        if (!snapshot) {
            const snapshotId = crypto.randomUUID();
            await db('eisenhower_snapshots')
                .insert({
                    id: snapshotId,
                    user_id: userId,
                    date: date
                });

            snapshot = await db('eisenhower_snapshots').where({ id: snapshotId }).first();
        }

        const items = await db('eisenhower_items')
            .where({ snapshot_id: snapshot.id })
            .orderBy('position', 'asc');

        res.json({ ...snapshot, items });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch today\'s snapshot' });
    }
});

// POST create item
router.post('/items', async (req: any, res) => {
    const { title, description, quadrant, task_id, date } = req.body;
    try {
        const userId = req.user?.id;
        const activeDate = date || new Date().toISOString().split('T')[0];

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        let snapshot = await db('eisenhower_snapshots')
            .where({ user_id: userId, date: activeDate })
            .first();

        if (!snapshot) {
            const snapshotId = crypto.randomUUID();
            await db('eisenhower_snapshots')
                .insert({
                    id: snapshotId,
                    user_id: userId,
                    date: activeDate
                });

            snapshot = await db('eisenhower_snapshots').where({ id: snapshotId }).first();
        }

        const itemId = crypto.randomUUID();
        await db('eisenhower_items')
            .insert({
                id: itemId,
                snapshot_id: snapshot.id,
                title,
                description,
                quadrant,
                task_id,
                position: 0
            });

        const item = await db('eisenhower_items').where({ id: itemId }).first();
        console.log(`[Eisenhower] Item created: ${item.id} - ${item.title}`);

        res.status(201).json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create Eisenhower item' });
    }
});

// PUT update item (supports single or bulk updates)
router.put('/items/:id', async (req: any, res) => {
    const { id } = req.params;
    const { bulk } = req.query;

    try {
        if (bulk === 'true') {
            const items = req.body; // Array of items
            if (!Array.isArray(items)) {
                return res.status(400).json({ error: 'Bulk update requires an array' });
            }

            await db.transaction(async (trx) => {
                for (const item of items) {
                    await trx('eisenhower_items')
                        .where({ id: item.id })
                        .update({
                            quadrant: item.quadrant,
                            position: item.position
                        });
                }
            });

            return res.json({ message: 'Bulk update successful' });
        } else {
            const updates = req.body;

            // Remove undefined values to avoid overwriting with null
            Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

            await db('eisenhower_items')
                .where({ id })
                .update(updates);

            const updatedItem = await db('eisenhower_items').where({ id }).first();

            if (!updatedItem) {
                return res.status(404).json({ error: 'Item not found' });
            }

            res.json(updatedItem);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update Eisenhower item' });
    }
});

// DELETE item
router.delete('/items/:id', async (req: any, res) => {
    const { id } = req.params;
    try {
        await db('eisenhower_items').where({ id }).del();
        res.json({ message: 'Item deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete Eisenhower item' });
    }
});

// GET summary for dashboard
router.get('/summary', async (req: any, res) => {
    try {
        const userId = req.user?.id;
        const date = (req.query.date as string) || new Date().toISOString().split('T')[0];

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const snapshot = await db('eisenhower_snapshots')
            .where({ user_id: userId, date: date })
            .first();

        if (!snapshot) {
            return res.json({ Q1_DO: 0, Q2_SCHEDULE: 0, Q3_DELEGATE: 0, Q4_DELETE: 0, top_items: [] });
        }

        const items = await db('eisenhower_items').where({ snapshot_id: snapshot.id });

        const summary = items.reduce((acc: any, item: any) => {
            acc[item.quadrant] = (acc[item.quadrant] || 0) + 1;
            return acc;
        }, { Q1_DO: 0, Q2_SCHEDULE: 0, Q3_DELEGATE: 0, Q4_DELETE: 0 });

        const topItems = items
            .filter((i: any) => i.quadrant === 'Q1_DO' || i.quadrant === 'Q2_SCHEDULE')
            .sort((a: any, b: any) => a.position - b.position)
            .slice(0, 3);

        res.json({ ...summary, top_items: topItems });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch Eisenhower summary' });
    }
});

export default router;

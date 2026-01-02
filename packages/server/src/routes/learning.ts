import express from 'express';
import db from '../db';

const router = express.Router();

// GET all decks with card counts
router.get('/decks', async (req, res) => {
    try {
        const userId = req.query.userId as string;
        // If no userId provided, fall back to first user (legacy behavior) or return empty?
        // For now, let's try to use the provided ID, otherwise fallback.
        let queryUserId = userId;

        if (!queryUserId) {
            const user = await db('users').first();
            if (!user) return res.status(404).json({ error: 'User not found' });
            queryUserId = user.id;
        }

        const decks = await db('decks')
            .select('decks.*')
            .count('cards.id as card_count')
            .leftJoin('cards', 'decks.id', 'cards.deck_id')
            .where('decks.user_id', queryUserId)
            .groupBy('decks.id');

        res.json(decks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch decks' });
    }
});

// POST create deck
router.post('/decks', async (req, res) => {
    try {
        const { title, description, userId } = req.body;

        let targetUserId = userId;
        if (!targetUserId) {
            const user = await db('users').first();
            if (!user) return res.status(404).json({ error: 'User not found' });
            targetUserId = user.id;
        }

        const [deck] = await db('decks').insert({
            user_id: targetUserId,
            title,
            description
        }).returning('*');

        res.status(201).json(deck);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create deck' });
    }
});

// POST create card
router.post('/decks/:id/cards', async (req, res) => {
    try {
        const { id } = req.params;
        const { front, back } = req.body;

        const [card] = await db('cards').insert({
            deck_id: id,
            front,
            back,
            next_review: new Date() // Due immediately by default
        }).returning('*');

        res.status(201).json(card);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create card' });
    }
});

// GET cards due for review in a deck
router.get('/decks/:id/review', async (req, res) => {
    try {
        const { id } = req.params;

        const dueCards = await db('cards')
            .where('deck_id', id)
            .where('next_review', '<=', new Date())
            .orderBy('next_review', 'asc')
            .limit(20);

        res.json(dueCards);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch cards for review' });
    }
});

// POST submit card review (SM-2 Algorithm)
router.post('/cards/:id/review', async (req, res) => {
    try {
        const { id } = req.params;
        const { grade } = req.body; // 0-5

        // Fetch current card state
        const card = await db('cards').where('id', id).first();
        if (!card) return res.status(404).json({ error: 'Card not found' });

        // SM-2 Algorithm Implementation
        let interval = card.interval;
        let repetitions = card.repetitions;
        let easeFactor = card.ease_factor;

        if (grade >= 3) {
            if (repetitions === 0) {
                interval = 1;
            } else if (repetitions === 1) {
                interval = 6;
            } else {
                interval = Math.round(interval * easeFactor);
            }
            repetitions += 1;
        } else {
            repetitions = 0;
            interval = 1;
        }

        easeFactor = easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
        if (easeFactor < 1.3) easeFactor = 1.3;

        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + interval);

        const [updatedCard] = await db('cards')
            .where('id', id)
            .update({
                next_review: nextReview,
                interval,
                repetitions,
                ease_factor: easeFactor
            })
            .returning('*');

        res.json(updatedCard);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to submit review' });
    }
});

export default router;

import express from 'express';
import db from '../db';

const router = express.Router();

// Auth handled by global middleware
const authenticateToken = (req: any, res: any, next: any) => next();

// GET user profile
router.get('/profile', authenticateToken, async (req: any, res) => {
    try {
        const user = await db('users').where({ id: req.user.id }).first();
        if (!user) return res.status(404).json({ error: 'User not found' });

        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// PUT update user profile
router.put('/profile', authenticateToken, async (req: any, res) => {
    try {
        const { name, username, description, profile_photo, preferences, accessibility } = req.body;

        const updates: any = {};
        if (name !== undefined) updates.name = name;
        if (username !== undefined) updates.username = username;
        if (description !== undefined) updates.description = description;
        if (profile_photo !== undefined) updates.profile_photo = profile_photo;
        if (preferences !== undefined) updates.preferences = JSON.stringify(preferences);
        if (accessibility !== undefined) updates.accessibility = JSON.stringify(accessibility);

        await db('users')
            .where({ id: req.user.id })
            .update(updates);

        const user = await db('users').where({ id: req.user.id }).first();
        const { password, ...updatedUser } = user;
        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// POST reset password (simplified for MVP)
router.post('/reset-password', authenticateToken, async (req: any, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await db('users').where({ id: req.user.id }).first();

        if (user.password !== currentPassword) {
            return res.status(401).json({ error: 'Invalid current password' });
        }

        await db('users')
            .where({ id: req.user.id })
            .update({ password: newPassword });

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

export default router;

import express from 'express';
import db from '../db';
// For MVP, using simple text match. In production, use bcrypt/argon2.
// import bcrypt from 'bcrypt'; 

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Check existing
        const existing = await db('users').where('email', email).first();
        if (existing) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const [user] = await db('users').insert({
            email,
            password, // TODO: Hash this in production!
            name
        }).returning(['id', 'email', 'name']);

        res.status(201).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        // Case-insensitive search for email
        const user = await db('users')
            .whereRaw('LOWER(email) = LOWER(?)', [trimmedEmail])
            .first();

        if (!user || String(user.password).trim() !== trimmedPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

export default router;

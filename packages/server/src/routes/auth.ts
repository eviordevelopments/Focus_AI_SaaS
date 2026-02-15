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

import fs from 'fs';
import path from 'path';

router.post('/login', async (req, res) => {
    try {
        let { email, password } = req.body;
        // Trim and normalize email for robustness
        email = email?.trim();
        password = password?.trim();

        const logFile = path.join(process.cwd(), 'login_debug.log');
        const logMsg = `[${new Date().toISOString()}] Login attempt: email=[${email}], password=[${password}]\n`;
        fs.appendFileSync(logFile, logMsg);

        // Case-insensitive search for email
        const user = await db('users').whereRaw('LOWER(email) = LOWER(?)', [email]).first();
        const userLog = `[${new Date().toISOString()}] User from DB: ${user ? JSON.stringify({ ...user, password: '***' }) : 'NOT FOUND'}\n`;
        fs.appendFileSync(logFile, userLog);

        if (!user || user.password !== password) {
            const failLog = `[${new Date().toISOString()}] Login failed: ${!user ? 'User not found' : `Password mismatch`}\n`;
            fs.appendFileSync(logFile, failLog);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);


    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed' });
    }
});

export default router;

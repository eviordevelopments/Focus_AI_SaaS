import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import taskRoutes from './routes/tasks';
import db from './db';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Fallback Auth Middleware for MVP
app.use(async (req, res, next) => {
    try {
        const user = await db('users').first();
        if (user) (req as any).user = user;
    } catch (e) {
        console.error('Auth middleware error:', e);
    }
    next();
});

import areaRoutes from './routes/areas';
import sessionRoutes from './routes/sessions';
import healthRoutes from './routes/health';
import learningRoutes from './routes/learning';
import aiRoutes from './routes/ai';
import authRoutes from './routes/auth';
import habitsRoutes from './routes/habits';
import eisenhowerRoutes from './routes/eisenhower';
import focusRoutes from './routes/focus';
import gamificationRoutes from './routes/gamification';

app.use('/api/tasks', taskRoutes);
app.use('/api/areas', areaRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/agent', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitsRoutes);
app.use('/api/eisenhower', eisenhowerRoutes);
app.use('/api/focus', focusRoutes);
app.use('/api/gamification', gamificationRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});

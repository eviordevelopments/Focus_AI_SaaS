import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import taskRoutes from './routes/tasks';
import db from './db';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Fallback Auth Middleware for MVP
app.use(async (req, res, next) => {
    try {
        // Prioritize emilcastle2608@gmail.com but fallback to any user
        let user = await db('users').where({ email: 'emilcastle2608@gmail.com' }).first();
        if (!user) user = await db('users').first();
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

import planningRoutes from './routes/planning';
import projectRoutes from './routes/projects';
import resourceRoutes from './routes/resources';
import analyticsRoutes from './routes/analytics';
import referenceRoutes from './routes/references';
import userRoutes from './routes/users';
import workflowRoutes from './routes/workflows';
import rewardRoutes from './routes/rewards';

app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/references', referenceRoutes);
app.use('/api/users', userRoutes);
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
app.use('/api/planning', planningRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/rewards', rewardRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});

import express from 'express';
import OpenAI from 'openai';
import db from '../db';

const router = express.Router();

// Initialize OpenAI client
// Note: Requires OPENAI_API_KEY in .env
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'mock-key', // Fallback for dev if not set, will fail actual calls
});

router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;

        // 1. Fetch user context (optional for MVP, but good for personalization)
        const user = await db('users').first();
        const recentSessions = await db('sessions').orderBy('start_time', 'desc').limit(3);
        const recentHealth = await db('health_entries').orderBy('date', 'desc').limit(1);

        // 2. Build System Prompt
        let systemPrompt = `You are Focus AI, a productivity coach and second brain agent. 
    Your goal is to help the user stay focused, manage burnout, and learn effectively.
    
    Context:
    User Name: ${user?.name || 'User'}
    `;

        if (recentHealth && recentHealth.length > 0) {
            systemPrompt += `Recent Health: Mood ${recentHealth[0].mood}/10, Stress ${recentHealth[0].stress}/10.\n`;
        }

        if (recentSessions && recentSessions.length > 0) {
            systemPrompt += `Recent Sessions: Last one was ${recentSessions[0].type} for ${recentSessions[0].actual_minutes} mins.\n`;
        }

        // 3. Call OpenAI
        // For MVP, we use a simple non-streaming response
        // If usage of 'mock-key', return mock response
        if (process.env.OPENAI_API_KEY) {
            const completion = await openai.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message }
                ],
                model: "gpt-4o",
            });

            res.json({ reply: completion.choices[0].message.content });
        } else {
            // Mock Response if no key
            console.log("No OPENAI_API_KEY found. Returning mock response.");
            res.json({ reply: "I'm Focus AI. I can't connect to my brain right now (Missing API Key), but I'm here to help you focus! Try adding your OPENAI_API_KEY to the .env file." });
        }

    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ error: 'Failed to generate response' });
    }
});

export default router;

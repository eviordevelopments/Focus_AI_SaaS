import db from '../db';
import { subDays, format } from 'date-fns';

export interface BurnoutScore {
    score: number;
    level: 'Healthy' | 'Caution' | 'Warning' | 'High Risk';
    factors: {
        workload: number;
        energy: number;
        mood: number;
        consistency: number;
        recovery: number;
    };
    advice: string;
}

export async function calculateBurnoutScore(userId: string): Promise<BurnoutScore> {
    const today = new Date();
    const weekAgo = subDays(today, 7);
    const dateStr = format(weekAgo, 'yyyy-MM-dd');

    // 1. Fetch data
    const logs = await db('daily_logs')
        .where({ user_id: userId })
        .where('date', '>=', dateStr);

    const systems = await db('focus_systems')
        .where({ user_id: userId });

    const recentSessions = await db('sessions')
        .where({ user_id: userId })
        .where('created_at', '>=', weekAgo.toISOString());

    // 2. Calculate Factors (0-100, where 100 is "High Burnout Risk" or bad state)

    // Workload: Ratio of hard routines vs. total routines
    const hardRoutines = logs.filter(l => l.completed && !l.used_easy_variant).length;
    const totalPossible = systems.length * 7;
    const workloadFactor = Math.min(100, (hardRoutines / (totalPossible || 1)) * 100);

    // Energy & Mood (averages, scaled 1-5 to 0-100, inverted so low is high risk)
    const avgEnergy = logs.reduce((acc, l) => acc + l.energy_level, 0) / (logs.length || 1);
    const energyFactor = 100 - (avgEnergy / 5) * 100;

    const avgMoodValue = logs.reduce((acc, l) => {
        const scores: any = { great: 5, good: 4, neutral: 3, low: 2, stressed: 1 };
        return acc + (scores[l.mood] || 3);
    }, 0) / (logs.length || 1);
    const moodFactor = 100 - (avgMoodValue / 5) * 100;

    // Consistency: Ratio of completed days
    const completedDays = logs.filter(l => l.completed).length;
    const consistencyFactor = 100 - (completedDays / (logs.length || 1)) * 100;

    // Recovery: Based on session intensity vs. logs? 
    // Or just a factor of mood + energy delta
    const recoveryFactor = Math.max(0, workloadFactor - (100 - energyFactor));

    // 3. Weighted Score
    // Higher score = higher burnout risk
    const finalScore = Math.round(
        workloadFactor * 0.3 +
        energyFactor * 0.25 +
        moodFactor * 0.2 +
        consistencyFactor * 0.15 +
        recoveryFactor * 0.1
    );

    let level: BurnoutScore['level'] = 'Healthy';
    let advice = "You're in the flow. Keep systems consistent but watch for ego-depletion.";

    if (finalScore > 75) {
        level = 'High Risk';
        advice = "CRITICAL: Deploy 'Easy-Day' variants for all systems immediately. Prioritize 8+ hours sleep.";
    } else if (finalScore > 50) {
        level = 'Warning';
        advice = "Burnout trending up. Reduce workload by 20% today.";
    } else if (finalScore > 25) {
        level = 'Caution';
        advice = "Slight fatigue detected. ensure tomorrow is a recovery-focused day.";
    }

    return {
        score: finalScore,
        level,
        factors: {
            workload: Math.round(workloadFactor),
            energy: Math.round(energyFactor),
            mood: Math.round(moodFactor),
            consistency: Math.round(consistencyFactor),
            recovery: Math.round(recoveryFactor)
        },
        advice
    };
}

import db from '../db';
import crypto from 'crypto';
import { differenceInDays, parseISO, format } from 'date-fns';

export interface XPResult {
    totalXP: number;
    baseXP: number;
    multipliers: {
        difficulty: number;
        streak: number;
        consistency: number;
        phase: number;
    };
}

export async function calculateXPEarned(userId: string, systemId: string, effortLevel: number, habitId?: string): Promise<XPResult> {
    const system = await db('focus_systems').where({ id: systemId }).first();
    let streak = null;

    if (habitId) {
        streak = await db('streaks').where({ user_id: userId, habit_id: habitId }).first();
    } else {
        streak = await db('streaks').where({ user_id: userId, system_id: systemId }).first();
    }

    let baseXP = system?.xp_base || 25;
    if (habitId) {
        const habit = await db('habits').where({ id: habitId }).first();
        baseXP = habit?.base_xp || 10;
    }

    // Multipliers
    const diffMult = { easy: 1.0, medium: 1.5, hard: 2.0 }[system?.difficulty as string] || 1.5;
    const streakMult = streak ? 1 + (Math.min(streak.current_streak, 30) * 0.1) : 1.0;
    const consistencyMult = effortLevel <= 2 ? 1.1 : 1.0; // Bonus for making it easy

    // Phase calculation (simplified: 1-21, 21-66, 66+)
    const currentStreak = streak?.current_streak || 0;
    let phaseMult = 1.0;
    if (currentStreak < 21) phaseMult = 1.2; // Dopamine boost for beginners
    else if (currentStreak < 66) phaseMult = 1.1;

    const totalXP = Math.round(baseXP * diffMult * streakMult * consistencyMult * phaseMult);

    return {
        totalXP,
        baseXP,
        multipliers: {
            difficulty: diffMult,
            streak: streakMult,
            consistency: consistencyMult,
            phase: phaseMult
        }
    };
}

export async function updateStreak(userId: string, systemId: string, logDate: string, habitId?: string): Promise<any> {
    const query = db('streaks').where({ user_id: userId });
    if (habitId) query.where({ habit_id: habitId });
    else query.where({ system_id: systemId });

    const streak = await query.first();
    const today = parseISO(logDate);

    if (!streak) {
        const newStreak = {
            id: crypto.randomUUID(),
            user_id: userId,
            system_id: habitId ? null : systemId,
            habit_id: habitId || null,
            current_streak: 1,
            best_streak: 1,
            last_completed_date: logDate,
            freeze_count: 0
        };
        await db('streaks').insert(newStreak);
        return { current: 1, action: 'start' };
    }

    const lastDate = parseISO(streak.last_completed_date);
    const diff = differenceInDays(today, lastDate);

    if (diff === 1) {
        // Continue streak
        const newStreakCount = streak.current_streak + 1;
        await db('streaks').where({ id: streak.id }).update({
            current_streak: newStreakCount,
            best_streak: Math.max(streak.best_streak, newStreakCount),
            last_completed_date: logDate
        });
        return { current: newStreakCount, action: 'continue' };
    } else if (diff === 0) {
        // Already updated today
        return { current: streak.current_streak, action: 'none' };
    } else {
        // Streak broken or grace day used?
        let graceApplied = false;
        if (habitId) {
            const habit = await db('habits').where({ id: habitId }).first();
            const allowedGap = (habit?.streak_protected_days || 0) + 1;
            if (diff <= allowedGap) {
                graceApplied = true;
            }
        }

        if (graceApplied || streak.freeze_count > 0) {
            const updateObj: any = { last_completed_date: logDate };
            if (!graceApplied && streak.freeze_count > 0) {
                updateObj.freeze_count = streak.freeze_count - 1;
            }

            await db('streaks').where({ id: streak.id }).update(updateObj);
            return { current: streak.current_streak, action: graceApplied ? 'grace_applied' : 'freeze_applied' };
        } else {
            await db('streaks').where({ id: streak.id }).update({
                current_streak: 1,
                last_completed_date: logDate
            });
            return { current: 1, action: 'reset' };
        }
    }
}

export async function checkAchievements(userId: string): Promise<string[]> {
    // Logic to check milestones and award badges
    const earned: string[] = [];
    const streaks = await db('streaks').where({ user_id: userId });

    for (const s of streaks) {
        if (s.current_streak === 1) earned.push('First Step');
        if (s.current_streak === 7) earned.push('Weekly Warrior');
        if (s.current_streak === 21) earned.push('Conscious Master');
        if (s.current_streak === 66) earned.push('Automaticity');
    }

    return earned;
}

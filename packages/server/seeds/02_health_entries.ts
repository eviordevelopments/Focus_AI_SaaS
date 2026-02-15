import type { Knex } from "knex";
import crypto from 'crypto';

export async function seed(knex: Knex): Promise<void> {
    // Get the first user
    const user = await knex("users").first();
    if (!user) {
        console.log('No user found, skipping health entries seed');
        return;
    }

    // Delete existing health entries for this user
    await knex("health_entries").where({ user_id: user.id }).del();

    // Generate 30 days of sample health data
    const healthEntries = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        // Generate realistic but varied data
        const sleepBase = 7 + Math.sin(i / 7) * 1.5; // Weekly pattern
        const moodBase = 7 + Math.cos(i / 5) * 2; // 5-day pattern
        const stressBase = 4 + Math.sin(i / 3) * 2; // 3-day pattern

        healthEntries.push({
            id: crypto.randomUUID(),
            user_id: user.id,
            date: dateStr,
            sleep_hours: Math.max(4, Math.min(10, sleepBase + (Math.random() - 0.5))),
            mood: Math.max(1, Math.min(10, Math.round(moodBase + (Math.random() - 0.5) * 2))),
            stress: Math.max(1, Math.min(10, Math.round(stressBase + (Math.random() - 0.5) * 2))),
            exercise_minutes: Math.max(0, Math.round(30 + Math.random() * 60)),
            screen_time_hours: Math.max(0, Math.min(12, 6 + (Math.random() - 0.5) * 4)),
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
        });
    }

    await knex("health_entries").insert(healthEntries);
    console.log(`Inserted ${healthEntries.length} health entries for user ${user.email}`);
}

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    // 1. Drop existing constraints in daily_logs that didn't include user_id
    // This ensures that logs are unique per user + (habit/system) + date
    await knex.schema.alterTable('daily_logs', (table) => {
        // These might fail if the index names don't match exactly what Knex expects,
        // but based on sqlite3 output, these are the standard names.
        table.dropUnique(['habit_id', 'date']);
        table.dropUnique(['system_id', 'date']);

        // 2. Re-create with user_id to ensure user-isolation
        table.unique(['user_id', 'habit_id', 'date']);
        table.unique(['user_id', 'system_id', 'date']);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('daily_logs', (table) => {
        table.dropUnique(['user_id', 'habit_id', 'date']);
        table.dropUnique(['user_id', 'system_id', 'date']);

        // Restore old constraints
        table.unique(['habit_id', 'date']);
        table.unique(['system_id', 'date']);
    });
}

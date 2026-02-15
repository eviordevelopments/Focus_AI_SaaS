import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('daily_logs', (table) => {
        // Drop the restrictive system-level constraint
        table.dropUnique(['user_id', 'system_id', 'date']);
    });

    // Create a partial unique index to allow only one "System Summary" log (habit_id is NULL)
    // but multiple habit logs per system.
    await knex.raw(`
        CREATE UNIQUE INDEX daily_logs_system_summary_unique 
        ON daily_logs (user_id, system_id, date) 
        WHERE habit_id IS NULL
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`DROP INDEX IF EXISTS daily_logs_system_summary_unique`);

    await knex.schema.alterTable('daily_logs', (table) => {
        table.unique(['user_id', 'system_id', 'date']);
    });
}


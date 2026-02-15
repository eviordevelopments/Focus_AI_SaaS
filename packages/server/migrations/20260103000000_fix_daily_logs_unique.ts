import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('daily_logs', (table) => {
        // Add unique constraint for habit_id and date
        table.unique(['habit_id', 'date']);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('daily_logs', (table) => {
        table.dropUnique(['habit_id', 'date']);
    });
}

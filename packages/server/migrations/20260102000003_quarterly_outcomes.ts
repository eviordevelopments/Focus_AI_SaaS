import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('quarterly_outcomes', (table) => {
        table.uuid('id').primary();
        table.uuid('identity_shift_id').references('id').inTable('quarterly_identity_shifts').onDelete('CASCADE');
        table.string('title').notNullable();
        table.integer('target_value').defaultTo(100);
        table.integer('current_value').defaultTo(0);
        table.string('status').defaultTo('planned'); // planned, in_progress, completed
        table.integer('order').defaultTo(0);
        table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('quarterly_outcomes');
}

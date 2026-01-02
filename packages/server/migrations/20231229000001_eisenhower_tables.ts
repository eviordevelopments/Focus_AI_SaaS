import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('eisenhower_snapshots', (table) => {
        table.uuid('id').primary();
        table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.date('date').notNullable();
        table.timestamps(true, true);
        table.unique(['user_id', 'date']);
    });

    await knex.schema.createTable('eisenhower_items', (table) => {
        table.uuid('id').primary();
        table.uuid('snapshot_id').references('id').inTable('eisenhower_snapshots').onDelete('CASCADE');
        table.uuid('task_id').references('id').inTable('tasks').onDelete('SET NULL').nullable();
        table.string('title').notNullable();
        table.text('description').nullable();
        table.enum('quadrant', ['Q1_DO', 'Q2_SCHEDULE', 'Q3_DELEGATE', 'Q4_DELETE']).notNullable();
        table.integer('position').defaultTo(0);
        table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('eisenhower_items');
    await knex.schema.dropTableIfExists('eisenhower_snapshots');
}

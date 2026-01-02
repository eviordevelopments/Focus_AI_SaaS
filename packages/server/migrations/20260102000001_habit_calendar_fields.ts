import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('habits', (table) => {
        table.time('start_time').nullable();
        table.time('end_time').nullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('habits', (table) => {
        table.dropColumn('end_time');
        table.dropColumn('start_time');
    });
}

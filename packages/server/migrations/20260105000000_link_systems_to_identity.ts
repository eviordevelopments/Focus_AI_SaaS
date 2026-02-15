import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('focus_systems', (table) => {
        table.uuid('identity_shift_id').references('id').inTable('quarterly_identity_shifts').onDelete('SET NULL').nullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('focus_systems', (table) => {
        table.dropColumn('identity_shift_id');
    });
}

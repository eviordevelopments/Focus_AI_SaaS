import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('focus_systems', (table) => {
        table.time('start_time').nullable();
        table.time('end_time').nullable();
        table.string('link').nullable();
        table.string('location').nullable();
        table.boolean('focus_session').defaultTo(false);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('focus_systems', (table) => {
        table.dropColumn('start_time');
        table.dropColumn('end_time');
        table.dropColumn('link');
        table.dropColumn('location');
        table.dropColumn('focus_session');
    });
}

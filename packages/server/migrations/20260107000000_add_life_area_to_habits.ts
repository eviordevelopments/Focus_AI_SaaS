import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('habits', (table) => {
        table.uuid('life_area_id').references('id').inTable('life_areas').onDelete('SET NULL').nullable();
        table.text('cue').nullable();
        table.text('reward').nullable();
        table.text('routine_hard').nullable();
        table.text('routine_easy').nullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('habits', (table) => {
        table.dropColumn('routine_easy');
        table.dropColumn('routine_hard');
        table.dropColumn('reward');
        table.dropColumn('cue');
        table.dropColumn('life_area_id');
    });
}

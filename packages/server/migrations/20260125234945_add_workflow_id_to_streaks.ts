import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('streaks', (table) => {
        table.uuid('workflow_id').references('id').inTable('workflows').onDelete('CASCADE').nullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('streaks', (table) => {
        table.dropColumn('workflow_id');
    });
}

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    // 1. Relate Identity Shifts to Life Areas
    await knex.schema.alterTable('quarterly_identity_shifts', (table) => {
        table.uuid('life_area_id').references('id').inTable('life_areas').onDelete('SET NULL').nullable();
    });

    // 2. Relate Outcomes to Life Areas (Denormalized for faster filtering)
    await knex.schema.alterTable('quarterly_outcomes', (table) => {
        table.uuid('life_area_id').references('id').inTable('life_areas').onDelete('SET NULL').nullable();
    });

    // 3. Relate Systems to Projects
    await knex.schema.alterTable('focus_systems', (table) => {
        table.uuid('project_id').references('id').inTable('projects').onDelete('SET NULL').nullable();
    });

    // 4. Relate Habits to Projects
    await knex.schema.alterTable('habits', (table) => {
        table.uuid('project_id').references('id').inTable('projects').onDelete('SET NULL').nullable();
    });

    // 5. New Table for Resource Attachments
    await knex.schema.createTable('resource_attachments', (table) => {
        table.uuid('id').primary();
        table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.uuid('life_area_id').references('id').inTable('life_areas').onDelete('CASCADE');
        table.uuid('project_id').references('id').inTable('projects').onDelete('SET NULL').nullable();
        table.string('name').notNullable();
        table.string('file_url').notNullable();
        table.string('file_type').notNullable(); // mime-type
        table.jsonb('metadata').nullable();
        table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('resource_attachments');

    await knex.schema.alterTable('habits', (table) => {
        table.dropColumn('project_id');
    });

    await knex.schema.alterTable('focus_systems', (table) => {
        table.dropColumn('project_id');
    });

    await knex.schema.alterTable('quarterly_outcomes', (table) => {
        table.dropColumn('life_area_id');
    });

    await knex.schema.alterTable('quarterly_identity_shifts', (table) => {
        table.dropColumn('life_area_id');
    });
}

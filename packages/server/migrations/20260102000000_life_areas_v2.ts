import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    // 1. Extend Life Areas Table
    await knex.schema.alterTable('life_areas', (table) => {
        // color_hex and importance (as importance) already exist from 20251230000000
        table.string('icon_key').nullable();
        table.text('identity_statement').nullable();
        table.renameColumn('importance', 'importance_rating');
        table.boolean('is_active').defaultTo(true);
    });

    // 2. Create Projects Table
    await knex.schema.createTable('projects', (table) => {
        table.uuid('id').primary();
        table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.uuid('life_area_id').references('id').inTable('life_areas').onDelete('CASCADE');
        table.string('name').notNullable();
        table.string('status').defaultTo('active'); // planning, active, completed, archived
        table.timestamp('deadline').nullable();
        table.float('progress').defaultTo(0);
        table.timestamps(true, true);
    });

    // 3. Extend Tasks Table for Project Linking
    await knex.schema.alterTable('tasks', (table) => {
        table.uuid('project_id').references('id').inTable('projects').onDelete('SET NULL');
    });

    // 4. Create Reviews Table (More granular than weekly_reviews)
    await knex.schema.createTable('reviews_v2', (table) => {
        table.uuid('id').primary();
        table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.uuid('life_area_id').references('id').inTable('life_areas').onDelete('CASCADE');
        table.string('type').notNullable(); // weekly, monthly, quarterly
        table.date('date').notNullable();
        table.text('content').nullable();
        table.integer('rating').nullable();
        table.timestamps(true, true);
    });

    // 5. Create Books Table
    await knex.schema.createTable('books', (table) => {
        table.uuid('id').primary();
        table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.uuid('life_area_id').references('id').inTable('life_areas').onDelete('CASCADE');
        table.string('title').notNullable();
        table.string('author').nullable();
        table.string('status').defaultTo('reading'); // reading, completed, paused
        table.integer('pages_read').defaultTo(0);
        table.integer('total_pages').nullable();
        table.date('start_date').nullable();
        table.date('finish_date').nullable();
        table.timestamps(true, true);
    });

    // 6. Create Notes Table
    await knex.schema.createTable('notes', (table) => {
        table.uuid('id').primary();
        table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.uuid('life_area_id').references('id').inTable('life_areas').onDelete('CASCADE');
        table.string('title').notNullable();
        table.text('content').nullable();
        table.string('tags').nullable(); // Comma separated or JSON string
        table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('notes');
    await knex.schema.dropTableIfExists('books');
    await knex.schema.dropTableIfExists('reviews_v2');

    await knex.schema.alterTable('tasks', (table) => {
        table.dropColumn('project_id');
    });

    await knex.schema.dropTableIfExists('projects');

    await knex.schema.alterTable('life_areas', (table) => {
        table.dropColumn('is_active');
        table.renameColumn('importance_rating', 'importance');
        table.dropColumn('identity_statement');
        table.dropColumn('icon_key');
    });
}

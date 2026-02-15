import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    // 1. Monthly Roadmap Configurations
    await knex.schema.createTable('monthly_roadmap_configs', (table) => {
        table.uuid('id').primary();
        table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').notNullable();
        table.integer('year').notNullable();
        table.integer('month').notNullable(); // 1-12
        table.text('checklist_requirements'); // Store as JSON string in SQLite
        table.text('mvl_tiers'); // Store as JSON string in SQLite
        table.timestamps(true, true);

        table.unique(['user_id', 'year', 'month']);
    });

    // 2. Monthly Achievements
    await knex.schema.createTable('monthly_achievements', (table) => {
        table.uuid('id').primary();
        table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').notNullable();
        table.integer('year').notNullable();
        table.integer('month').nullable(); // Null for quarterly/annual achievements
        table.integer('quarter').nullable(); // 1-4
        table.string('achievement_type').notNullable(); // month_completion, quarter_completion
        table.string('title').notNullable();
        table.integer('xp_earned').defaultTo(0);
        table.string('trophy_id').nullable();
        table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('monthly_achievements');
    await knex.schema.dropTableIfExists('monthly_roadmap_configs');
}

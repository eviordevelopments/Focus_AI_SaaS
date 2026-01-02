import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    // 1. Alter Life Areas
    await knex.schema.alterTable('life_areas', (table) => {
        table.integer('importance').defaultTo(5);
        table.string('color_hex').defaultTo('#6366f1');
        table.text('description').nullable();
    });

    // 2. Systems
    await knex.schema.createTable('focus_systems', (table) => {
        table.uuid('id').primary();
        table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.uuid('life_area_id').references('id').inTable('life_areas').onDelete('SET NULL');
        table.string('name').notNullable();
        table.text('description').nullable();
        table.text('cue').nullable();
        table.text('routine_hard').nullable();
        table.text('routine_easy').nullable();
        table.text('reward').nullable();
        table.string('difficulty').defaultTo('medium');
        table.integer('duration_minutes').defaultTo(30);
        table.string('scheduled_days').nullable(); // JSON stringify of days
        table.string('supports_identity').nullable();
        table.timestamps(true, true);
    });

    // 3. Daily Logs
    await knex.schema.createTable('daily_logs', (table) => {
        table.uuid('id').primary();
        table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.uuid('system_id').references('id').inTable('focus_systems').onDelete('CASCADE');
        table.date('date').notNullable();
        table.boolean('completed').defaultTo(false);
        table.integer('effort_level').defaultTo(3);
        table.string('mood').nullable();
        table.integer('energy_level').defaultTo(3);
        table.text('notes').nullable();
        table.boolean('used_easy_variant').defaultTo(false);
        table.integer('actual_duration_minutes').nullable();
        table.timestamps(true, true);
        table.unique(['system_id', 'date']);
    });

    // 4. Weekly Reviews
    await knex.schema.createTable('weekly_reviews', (table) => {
        table.uuid('id').primary();
        table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.date('week_start_date').notNullable();
        table.integer('adherence_percentage').defaultTo(0);
        table.integer('burnout_score').defaultTo(0);
        table.string('bottleneck').nullable();
        table.text('celebrated_wins').nullable(); // JSON stringify
        table.integer('values_alignment_score').defaultTo(0);
        table.text('planned_adjustments').nullable(); // JSON stringify
        table.timestamps(true, true);
        table.unique(['user_id', 'week_start_date']);
    });

    // 5. Quarterly Identity Shifts
    await knex.schema.createTable('quarterly_identity_shifts', (table) => {
        table.uuid('id').primary();
        table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.string('quarter').notNullable(); // Q1, Q2, Q3, Q4
        table.integer('year').notNullable();
        table.string('primary_identity').notNullable();
        table.text('vision_statement').nullable();
        table.text('goals').nullable(); // JSON stringify
        table.timestamps(true, true);
        table.unique(['user_id', 'quarter', 'year']);
    });

    // 6. Future Identities
    await knex.schema.createTable('future_identities', (table) => {
        table.uuid('id').primary();
        table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.integer('target_year').notNullable();
        table.text('description').notNullable();
        table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('future_identities');
    await knex.schema.dropTableIfExists('quarterly_identity_shifts');
    await knex.schema.dropTableIfExists('weekly_reviews');
    await knex.schema.dropTableIfExists('daily_logs');
    await knex.schema.dropTableIfExists('focus_systems');
    await knex.schema.dropTableIfExists('life_areas');
}

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    // 1. Identities (Character Profiles)
    // We already have quarterly_identity_shifts, but we need a persistent 'Character' model for XP
    await knex.schema.createTable('identities', (table) => {
        table.uuid('id').primary();
        table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.string('name').notNullable(); // e.g., "Writer", "Athlete"
        table.integer('level').defaultTo(1);
        table.integer('xp').defaultTo(0);
        table.uuid('life_area_id').references('id').inTable('life_areas').onDelete('SET NULL');
        table.boolean('is_active').defaultTo(true);
        table.timestamps(true, true);
    });

    // 2. Streaks
    await knex.schema.createTable('streaks', (table) => {
        table.uuid('id').primary();
        table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.uuid('system_id').references('id').inTable('focus_systems').onDelete('CASCADE');
        table.integer('current_streak').defaultTo(0);
        table.integer('best_streak').defaultTo(0);
        table.date('last_completed_date').nullable();
        table.integer('freeze_count').defaultTo(0); // Available freezes
        table.timestamps(true, true);
        table.unique(['user_id', 'system_id']);
    });

    // 3. Achievements
    await knex.schema.createTable('achievements', (table) => {
        table.uuid('id').primary();
        table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.string('badge_type').notNullable(); // e.g. "First Step", "Automaticity"
        table.string('tier').defaultTo('bronze'); // bronze, silver, gold, legendary
        table.timestamp('earned_at').defaultTo(knex.fn.now());
    });

    // 4. Update Focus Systems for base XP
    await knex.schema.alterTable('focus_systems', (table) => {
        table.integer('xp_base').defaultTo(25);
        table.uuid('identity_id').references('id').inTable('identities').onDelete('SET NULL');
    });

    // 5. Update Daily Logs for XP earned
    await knex.schema.alterTable('daily_logs', (table) => {
        table.integer('xp_earned').defaultTo(0);
    });

    // 6. Burnout Factors (Daily Snapshot)
    await knex.schema.createTable('burnout_factors', (table) => {
        table.uuid('id').primary();
        table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.date('date').notNullable();
        table.integer('workload').defaultTo(0);
        table.integer('autonomy').defaultTo(0);
        table.integer('recovery').defaultTo(0);
        table.integer('values_alignment').defaultTo(0);
        table.integer('social_support').defaultTo(0);
        table.integer('score').defaultTo(0);
        table.timestamps(true, true);
        table.unique(['user_id', 'date']);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('burnout_factors');
    await knex.schema.alterTable('daily_logs', (table) => {
        table.dropColumn('xp_earned');
    });
    await knex.schema.alterTable('focus_systems', (table) => {
        table.dropColumn('identity_id');
        table.dropColumn('xp_base');
    });
    await knex.schema.dropTableIfExists('achievements');
    await knex.schema.dropTableIfExists('streaks');
    await knex.schema.dropTableIfExists('identities');
}

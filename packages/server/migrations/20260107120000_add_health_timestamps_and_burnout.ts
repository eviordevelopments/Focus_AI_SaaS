import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    // Add timestamp tracking to health_entries
    await knex.schema.alterTable('health_entries', (table) => {
        table.timestamp('logged_at').nullable();
        table.decimal('burnout_score', 5, 2).nullable();
    });

    // Create health_achievements table
    await knex.schema.createTable('health_achievements', (table) => {
        table.uuid('id').primary().defaultTo(knex.fn.uuid());
        table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.string('achievement_key', 50).notNullable();
        table.timestamp('unlocked_at').defaultTo(knex.fn.now());
        table.integer('xp_earned').defaultTo(0);
        table.timestamps(true, true);
    });

    // Create health_streaks table
    await knex.schema.createTable('health_streaks', (table) => {
        table.uuid('id').primary().defaultTo(knex.fn.uuid());
        table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').unique();
        table.integer('current_streak').defaultTo(0);
        table.integer('longest_streak').defaultTo(0);
        table.date('last_logged_date').nullable();
        table.integer('total_xp').defaultTo(0);
        table.string('current_level').defaultTo('bronze');
        table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('health_streaks');
    await knex.schema.dropTableIfExists('health_achievements');

    await knex.schema.alterTable('health_entries', (table) => {
        table.dropColumn('burnout_score');
        table.dropColumn('logged_at');
    });
}

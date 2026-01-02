import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    // 1. Extend Habits Table
    await knex.schema.alterTable('habits', (table) => {
        table.text('identity_statement').nullable();
        table.string('days_of_week').nullable(); // JSON stringify of [0,1,2,3,4,5,6]
        table.string('color_hex').defaultTo('#6366f1');
        table.integer('streak_protected_days').defaultTo(0);
        table.string('icon_key').nullable();
        table.integer('estimated_duration_minutes').nullable();
        table.boolean('is_active').defaultTo(true);
    });

    // 2. Extend Daily Logs (Habit Completions)
    await knex.schema.alterTable('daily_logs', (table) => {
        table.timestamp('completion_time').nullable();
        table.integer('quality_rating').nullable(); // 1-5 or 1-10
        table.integer('streak_count_after_completion').nullable();
    });

    // 3. Extend Trophies Table
    await knex.schema.alterTable('trophies', (table) => {
        table.string('scope').defaultTo('global'); // habit, system, area, global
        table.uuid('related_id').nullable(); // References habit_id, system_id, or area_id
        table.text('description').nullable();
        table.integer('xp_reward').defaultTo(100);
    });

    // 4. Create Day Summaries Table
    await knex.schema.createTable('day_summaries', (table) => {
        table.uuid('id').primary();
        table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.date('date').notNullable();
        table.integer('habits_scheduled').defaultTo(0);
        table.integer('habits_completed').defaultTo(0);
        table.float('completion_rate').defaultTo(0); // 0.0 to 1.0
        table.integer('xp_earned').defaultTo(0);
        table.integer('average_habit_quality').nullable();
        table.text('notes').nullable();
        table.timestamps(true, true);
        table.unique(['user_id', 'date']);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('day_summaries');

    await knex.schema.alterTable('trophies', (table) => {
        table.dropColumn('xp_reward');
        table.dropColumn('description');
        table.dropColumn('related_id');
        table.dropColumn('scope');
    });

    await knex.schema.alterTable('daily_logs', (table) => {
        table.dropColumn('streak_count_after_completion');
        table.dropColumn('quality_rating');
        table.dropColumn('completion_time');
    });

    await knex.schema.alterTable('habits', (table) => {
        table.dropColumn('is_active');
        table.dropColumn('estimated_duration_minutes');
        table.dropColumn('icon_key');
        table.dropColumn('streak_protected_days');
        table.dropColumn('color_hex');
        table.dropColumn('days_of_week');
        table.dropColumn('identity_statement');
    });
}

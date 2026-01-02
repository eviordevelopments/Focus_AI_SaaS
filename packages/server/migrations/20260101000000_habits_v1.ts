import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    // 0. Drop Legacy Habits
    await knex.schema.dropTableIfExists('habits');

    // 1. Habits Table (Hierarchical: Area > System > Habit)
    await knex.schema.createTable('habits', (table) => {
        table.uuid('id').primary();
        table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.uuid('system_id').references('id').inTable('focus_systems').onDelete('CASCADE');
        table.string('name').notNullable();
        table.text('description').nullable();
        table.string('scheduled_time').nullable(); // e.g., "08:30"
        table.integer('order').defaultTo(0);
        table.string('frequency').defaultTo('daily');
        table.string('habit_type').defaultTo('habit'); // habit, ritual, quest
        table.integer('base_xp').defaultTo(10);
        table.timestamps(true, true);
    });

    // 2. Trophies Table (Milestone Rewards)
    await knex.schema.createTable('trophies', (table) => {
        table.uuid('id').primary();
        table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.string('type').notNullable(); // trophy, medal, badge
        table.string('name').notNullable();
        table.string('icon_name').nullable();
        table.timestamp('earned_at').defaultTo(knex.fn.now());
        table.timestamps(true, true);
    });

    // 3. Update Daily Logs for Habit-level tracking
    await knex.schema.alterTable('daily_logs', (table) => {
        table.uuid('habit_id').references('id').inTable('habits').onDelete('CASCADE').nullable();
    });

    // 4. Update Streaks for Habit-level tracking
    await knex.schema.alterTable('streaks', (table) => {
        table.uuid('habit_id').references('id').inTable('habits').onDelete('CASCADE').nullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('streaks', (table) => {
        table.dropColumn('habit_id');
    });
    await knex.schema.alterTable('daily_logs', (table) => {
        table.dropColumn('habit_id');
    });
    await knex.schema.dropTableIfExists('trophies');
    await knex.schema.dropTableIfExists('habits');
}

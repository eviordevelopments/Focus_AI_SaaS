import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    // 1. Workflows
    await knex.schema.createTable('workflows', (table) => {
        table.uuid('id').primary();
        table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.uuid('life_area_id').references('id').inTable('life_areas').onDelete('CASCADE');
        table.uuid('system_id').references('id').inTable('focus_systems').onDelete('SET NULL');
        table.uuid('project_id').references('id').inTable('projects').onDelete('SET NULL');
        table.string('name').notNullable();
        table.string('emoji').nullable();
        table.string('color').nullable();
        table.text('description').nullable();
        table.json('tags').nullable(); // Array of strings
        table.string('type').defaultTo('manual'); // 'manual', 'block'
        table.string('status').defaultTo('active'); // 'active', 'draft', 'archived'
        table.timestamps(true, true);
    });

    // 2. Workflow Steps
    await knex.schema.createTable('workflow_steps', (table) => {
        table.uuid('id').primary();
        table.uuid('workflow_id').references('id').inTable('workflows').onDelete('CASCADE');
        table.integer('order').notNullable().defaultTo(0);
        table.string('step_type').notNullable(); // 'app', 'agent', 'function', 'timer', 'note'
        table.json('config').notNullable();
        table.timestamps(true, true);
    });

    // 3. Workflow Runs (Execution Log)
    await knex.schema.createTable('workflow_runs', (table) => {
        table.uuid('id').primary();
        table.uuid('workflow_id').references('id').inTable('workflows').onDelete('CASCADE');
        table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.timestamp('start_time').defaultTo(knex.fn.now());
        table.timestamp('end_time').nullable();
        table.string('status').defaultTo('running'); // 'running', 'completed', 'abandoned'
        table.timestamps(true, true);
    });

    // 4. Block Sessions (Time blocking context)
    await knex.schema.createTable('block_sessions', (table) => {
        table.uuid('id').primary();
        table.uuid('workflow_run_id').references('id').inTable('workflow_runs').onDelete('CASCADE');
        table.date('date').notNullable();
        table.string('technique').nullable(); // 'timebox', 'batch', 'pomodoro'
        table.json('completed_steps').nullable(); // Array of step IDs
        table.integer('xp_earned').defaultTo(0);
        table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('block_sessions');
    await knex.schema.dropTableIfExists('workflow_runs');
    await knex.schema.dropTableIfExists('workflow_steps');
    await knex.schema.dropTableIfExists('workflows');
}

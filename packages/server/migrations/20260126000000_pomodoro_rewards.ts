import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    // 1. Unlocked Assets (Islands, Special Trees, Decorations)
    await knex.schema.createTable('unlocked_assets', (table) => {
        table.uuid('id').primary();
        table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.string('asset_type').notNullable(); // 'island', 'tree', 'object'
        table.string('asset_key').notNullable();  // e.g., 'evergreen', 'zen_island'
        table.timestamp('unlocked_at').defaultTo(knex.fn.now());
        table.unique(['user_id', 'asset_key']);
    });

    // 2. Planted Trees (The actual garden data)
    await knex.schema.createTable('planted_trees', (table) => {
        table.uuid('id').primary();
        table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.uuid('session_id').references('id').inTable('sessions').onDelete('SET NULL');
        table.string('tree_type').notNullable();
        table.float('position_x').defaultTo(0);
        table.float('position_y').defaultTo(0);
        table.integer('island_index').defaultTo(0);
        table.timestamp('planted_at').defaultTo(knex.fn.now());
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('planted_trees');
    await knex.schema.dropTableIfExists('unlocked_assets');
}

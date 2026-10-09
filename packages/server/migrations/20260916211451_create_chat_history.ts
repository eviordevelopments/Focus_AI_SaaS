import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('conversations', (table) => {
        table.increments('id').primary();
        table.string('title').notNullable().defaultTo('Nueva conversación');
        table.string('agent_id').nullable();
        table.string('mode').nullable();
        table.boolean('is_archived').defaultTo(false);
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });

    await knex.schema.createTable('chat_messages', (table) => {
        table.increments('id').primary();
        table.integer('conversation_id').unsigned().references('id').inTable('conversations').onDelete('CASCADE');
        table.string('role').notNullable(); // 'user' | 'assistant' | 'system'
        table.text('content').notNullable();
        table.text('sources').nullable(); // JSON string for references
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('chat_messages');
    await knex.schema.dropTableIfExists('conversations');
}

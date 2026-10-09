import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("vault_chunks", (table) => {
        table.increments("id").primary();
        table.string("file_name").notNullable();
        table.text("content").notNullable();
        table.text("embedding").notNullable(); // JSON string of the vector
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists("vault_chunks");
}


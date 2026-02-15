import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    // Check if we are using Postgres or SQLite to handle the alter correctly
    await knex.schema.alterTable("users", (table) => {
        // In Knex, altering a column type usually requires text() and alter().
        // For SQLite, types are dynamic, but for PG it matters.
        table.text("profile_photo").alter().nullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable("users", (table) => {
        table.string("profile_photo").alter().nullable();
    });
}

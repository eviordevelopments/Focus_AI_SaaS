import Knex from "knex";

export async function up(knex: any): Promise<void> {
    // Decks Table
    await knex.schema.createTable("decks", (table) => {
        table.uuid("id").primary().defaultTo(knex.fn.uuid());
        table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE");
        table.string("title").notNullable();
        table.text("description");
        table.timestamp("created_at").defaultTo(knex.fn.now());
    });

    // Cards Table
    await knex.schema.createTable("cards", (table) => {
        table.uuid("id").primary().defaultTo(knex.fn.uuid());
        table.uuid("deck_id").references("id").inTable("decks").onDelete("CASCADE");

        table.text("front").notNullable();
        table.text("back").notNullable();

        // SM-2 Algorithm Fields
        table.timestamp("next_review").defaultTo(knex.fn.now());
        table.integer("interval").defaultTo(0); // Days
        table.float("ease_factor").defaultTo(2.5);
        table.integer("repetitions").defaultTo(0);

        table.timestamp("created_at").defaultTo(knex.fn.now());
    });
}

export async function down(knex: any): Promise<void> {
    await knex.schema.dropTableIfExists("cards");
    await knex.schema.dropTableIfExists("decks");
}

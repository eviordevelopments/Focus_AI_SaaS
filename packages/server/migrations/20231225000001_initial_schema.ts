import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    // 1. Users
    await knex.schema.createTable("users", (table) => {
        table.uuid("id").primary().defaultTo(knex.fn.uuid());
        table.string("email").unique().notNullable();
        table.string("name");
        table.timestamp("created_at").defaultTo(knex.fn.now());
    });

    // 2. Life Areas
    await knex.schema.createTable("life_areas", (table) => {
        table.uuid("id").primary().defaultTo(knex.fn.uuid());
        table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE");
        table.string("name").notNullable(); // Work, Study, Health...
        table.timestamp("created_at").defaultTo(knex.fn.now());
    });

    // 3. Tasks
    await knex.schema.createTable("tasks", (table) => {
        table.uuid("id").primary().defaultTo(knex.fn.uuid());
        table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE");
        table.uuid("area_id").references("id").inTable("life_areas").onDelete("SET NULL");
        table.string("title").notNullable();
        table.text("description");
        table.string("status").defaultTo("todo"); // todo, in_progress, done
        table.integer("priority").defaultTo(1); // 1-5
        table.timestamp("due_date");
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("completed_at");
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("tasks");
    await knex.schema.dropTableIfExists("life_areas");
    await knex.schema.dropTableIfExists("users");
}

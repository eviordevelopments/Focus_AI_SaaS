import Knex from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("health_entries", (table) => {
        table.uuid("id").primary().defaultTo(knex.fn.uuid());
        table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE");
        table.date("date").notNullable();

        table.float("sleep_hours").notNullable();
        table.integer("mood").notNullable(); // 1-10
        table.integer("stress").notNullable(); // 1-10
        table.float("screen_time_hours").defaultTo(0);
        table.integer("exercise_minutes").defaultTo(0);

        table.timestamp("created_at").defaultTo(knex.fn.now());

        // Ensure one entry per user per day
        table.unique(["user_id", "date"]);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("health_entries");
}

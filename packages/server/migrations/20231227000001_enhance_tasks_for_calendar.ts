import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable("tasks", (table) => {
        table.timestamp("start_time");
        table.timestamp("end_time");
        table.boolean("is_recurring").defaultTo(false);
        // Using text/string for array/json data to be safe across SQLite/Postgres for MVP if strict types aren't set up
        // But we can try json if supported. Let's use string/text for now to be safe with SQLite dev.
        table.text("recurring_days"); // e.g. JSON string '["Mon", "Wed"]'
        table.string("location");
        table.text("links"); // JSON string or simple text
        table.string("color"); // Hex code
        table.text("session_config"); // JSON string e.g. '{ "type": "deepwork", "duration": 45 }'

        // Ensure due_date is still the primary "day" identifier, whilst start_time is specific.
        // If start_time is present, it implicitly sets the time of the due_date.
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable("tasks", (table) => {
        table.dropColumn("start_time");
        table.dropColumn("end_time");
        table.dropColumn("is_recurring");
        table.dropColumn("recurring_days");
        table.dropColumn("location");
        table.dropColumn("links");
        table.dropColumn("color");
        table.dropColumn("session_config");
    });
}

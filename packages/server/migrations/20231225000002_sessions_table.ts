import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("sessions", (table) => {
        table.uuid("id").primary().defaultTo(knex.fn.uuid());
        table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE");
        table.uuid("task_id").references("id").inTable("tasks").onDelete("SET NULL"); // Optional link

        table.string("type").notNullable(); // 'pomodoro', 'deepwork', 'custom'
        table.timestamp("start_time").defaultTo(knex.fn.now());
        table.timestamp("end_time"); // Nullable (active session)

        table.integer("planned_minutes").notNullable();
        table.integer("actual_minutes").defaultTo(0);

        // Post-session metrics
        table.integer("focus_quality"); // 1-10
        table.integer("distractions").defaultTo(0);
        table.text("notes");
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("sessions");
}

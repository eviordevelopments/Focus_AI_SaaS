import type { Knex } from "knex";

export async function up(knex: any): Promise<void> {
    await knex.schema.createTable("habits", (table: any) => {
        table.uuid("id").primary().defaultTo(knex.fn.uuid());
        table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE");
        table.string("title").notNullable();
        table.string("frequency").defaultTo("daily"); // daily, weekly
        table.integer("streak").defaultTo(0);
        table.integer("best_streak").defaultTo(0);
        table.json("completed_dates").defaultTo("[]"); // Store as JSON string array
        table.timestamp("created_at").defaultTo(knex.fn.now());
    });
}

export async function down(knex: any): Promise<void> {
    await knex.schema.dropTableIfExists("habits");
}

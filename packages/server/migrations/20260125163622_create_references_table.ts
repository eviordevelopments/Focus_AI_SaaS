import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("references", (table) => {
        table.uuid("id").primary().defaultTo(knex.fn.uuid());
        table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE");
        table.uuid("life_area_id").references("id").inTable("life_areas").onDelete("SET NULL").nullable();
        table.uuid("project_id").references("id").inTable("projects").onDelete("SET NULL").nullable();
        table.uuid("task_id").references("id").inTable("tasks").onDelete("SET NULL").nullable();

        table.string("title").notNullable();
        table.text("description").nullable();
        table.string("type").notNullable(); // link, file, note
        table.text("content").nullable(); // For notes or content
        table.string("url").nullable();
        table.string("file_path").nullable();
        table.json("tags").nullable();
        table.boolean("is_favorite").defaultTo(false);

        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("references");
}


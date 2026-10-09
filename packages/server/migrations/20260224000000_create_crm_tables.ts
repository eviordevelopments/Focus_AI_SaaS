import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    // 1. Contacts
    await knex.schema.createTable("contacts", (table) => {
        table.uuid("id").primary().defaultTo(knex.fn.uuid());
        table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE").notNullable();
        table.string("name").notNullable();
        table.string("email");
        table.string("phone");
        table.text("bio");
        table.string("avatar");
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
    });

    // 2. Contact Tags
    await knex.schema.createTable("contact_tags", (table) => {
        table.uuid("id").primary().defaultTo(knex.fn.uuid());
        table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE").notNullable();
        table.string("name").notNullable();
        table.string("color").defaultTo("#4A90E2");
    });

    // 3. Contact Tag Mapping (Many-to-Many)
    await knex.schema.createTable("contact_tag_map", (table) => {
        table.uuid("contact_id").references("id").inTable("contacts").onDelete("CASCADE").notNullable();
        table.uuid("tag_id").references("id").inTable("contact_tags").onDelete("CASCADE").notNullable();
        table.primary(["contact_id", "tag_id"]);
    });

    // 4. Contact Life Areas (Many-to-Many)
    await knex.schema.createTable("contact_life_areas", (table) => {
        table.uuid("contact_id").references("id").inTable("contacts").onDelete("CASCADE").notNullable();
        table.uuid("area_id").references("id").inTable("life_areas").onDelete("CASCADE").notNullable();
        table.primary(["contact_id", "area_id"]);
    });

    // 5. Contact Reminders
    await knex.schema.createTable("contact_reminders", (table) => {
        table.uuid("id").primary().defaultTo(knex.fn.uuid());
        table.uuid("contact_id").references("id").inTable("contacts").onDelete("CASCADE").notNullable();
        table.string("message").notNullable();
        table.timestamp("remind_at").notNullable();
        table.string("status").defaultTo("pending"); // pending, completed, cancelled
        table.timestamp("created_at").defaultTo(knex.fn.now());
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("contact_reminders");
    await knex.schema.dropTableIfExists("contact_life_areas");
    await knex.schema.dropTableIfExists("contact_tag_map");
    await knex.schema.dropTableIfExists("contact_tags");
    await knex.schema.dropTableIfExists("contacts");
}

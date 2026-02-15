import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable("users", (table) => {
        table.string("username").unique().nullable();
        table.text("description").nullable();
        table.string("profile_photo").nullable();
        table.json("preferences").nullable();
        table.json("accessibility").nullable();
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable("users", (table) => {
        table.dropColumn("username");
        table.dropColumn("description");
        table.dropColumn("profile_photo");
        table.dropColumn("preferences");
        table.dropColumn("accessibility");
    });
}


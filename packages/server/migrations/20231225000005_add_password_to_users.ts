import Knex from "knex";

export async function up(knex: any): Promise<void> {
    await knex.schema.alterTable("users", (table: any) => {
        table.string("password").nullable(); // Nullable for existing users, handle migration logic if needed
    });
}

export async function down(knex: any): Promise<void> {
    await knex.schema.alterTable("users", (table: any) => {
        table.dropColumn("password");
    });
}

import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("tasks").del();
    await knex("life_areas").del();
    await knex("users").del();

    // Create default user
    const [user] = await knex("users").insert({
        email: "user@example.com",
        name: "Focus User"
    }).returning("*");

    // Create default areas for this user
    const areas = ["Work", "Study", "Health", "Finance", "Personal"];

    for (const areaName of areas) {
        await knex("life_areas").insert({
            user_id: user.id,
            name: areaName
        });
    }
}

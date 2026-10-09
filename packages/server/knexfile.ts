import type { Knex } from "knex";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const config: { [key: string]: Knex.Config } = {
    development: {
        client: "sqlite3",
        connection: {
            filename: path.join(__dirname, "dev.sqlite3")
        },
        useNullAsDefault: true,
        migrations: {
            tableName: "knex_migrations",
            extension: "ts"
        },
        seeds: {
            directory: "./seeds"
        }
    },
    production: {
        client: "sqlite3",
        connection: {
            filename: path.join(__dirname, "prod.sqlite3")
        },
        useNullAsDefault: true,
        migrations: {
            tableName: "knex_migrations"
        }
    }

};

export default config;

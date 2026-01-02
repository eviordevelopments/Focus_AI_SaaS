"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, "../../.env") });
const config = {
    development: {
        client: "sqlite3",
        connection: {
            filename: "./dev.sqlite3"
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
            filename: "./prod.sqlite3"
        },
        useNullAsDefault: true,
        migrations: {
            tableName: "knex_migrations"
        }
    }
};
exports.default = config;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
exports.env = {
    // Banco de dados
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: parseInt(process.env.DB_PORT || '5432'),
    DB_USERNAME: process.env.DB_USERNAME || 'postgres',
    DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',
    DB_DATABASE: process.env.DB_DATABASE || 'siob-mobile',
    DATABASE_URL: process.env.DATABASE_URL,
    // Ambiente
    NODE_ENV: process.env.NODE_ENV || 'development',
    // Hash de senhas
    BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10')
};

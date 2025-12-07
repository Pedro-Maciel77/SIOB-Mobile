"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const entities = __importStar(require("../entities"));
const env_1 = require("./env");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    // Usa DATABASE_URL do Railway ou variáveis locais
    url: env_1.env.DATABASE_URL || `postgresql://${env_1.env.DB_USERNAME}:${env_1.env.DB_PASSWORD}@${env_1.env.DB_HOST}:${env_1.env.DB_PORT}/${env_1.env.DB_DATABASE}`,
    // SSL para produção (Railway)
    ssl: env_1.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false,
    synchronize: false, // IMPORTANTE: Nunca true em produção
    logging: env_1.env.NODE_ENV === 'development',
    entities: Object.values(entities),
    migrations: ['src/migrations/*.ts'],
    migrationsTableName: 'typeorm_migrations',
    subscribers: [],
    extra: {
        connectionTimeoutMillis: 10000,
        max: 20
    }
});

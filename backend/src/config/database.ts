import { DataSource } from 'typeorm';
import * as entities from '../entities';

export const AppDataSource = new DataSource({
  type: 'postgres',

  // ✅ Neon usa URL completa
  url: process.env.DATABASE_URL,

  // ✅ SSL obrigatório no Neon
  ssl: {
    rejectUnauthorized: false,
  },

  logging: process.env.NODE_ENV === 'development',
  synchronize: false,

  entities: Object.values(entities),
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'typeorm_migrations',

  // ✅ Importante para o driver pg
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
    connectionTimeoutMillis: 10000,
    max: 20,
  },
});

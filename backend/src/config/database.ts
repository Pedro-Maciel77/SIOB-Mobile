import { DataSource } from 'typeorm';
import * as entities from '../entities';
import { env } from './env';

export const AppDataSource = new DataSource({
  type: 'postgres',
  
  // Usa DATABASE_URL do Railway ou variáveis locais
  url: env.DATABASE_URL || `postgresql://${env.DB_USERNAME}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_DATABASE}`,
  
  // SSL para produção (Railway)
  ssl: env.NODE_ENV === 'production' ? { 
    rejectUnauthorized: false 
  } : false,
  
  synchronize: false, // IMPORTANTE: Nunca true em produção
  logging: env.NODE_ENV === 'development',
  entities: Object.values(entities),
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'typeorm_migrations',
  subscribers: [],
  extra: {
    connectionTimeoutMillis: 10000,
    max: 20
  }
});
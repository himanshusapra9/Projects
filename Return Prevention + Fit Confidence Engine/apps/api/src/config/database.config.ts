import { registerAs } from '@nestjs/config';

export interface PostgresConfig {
  url?: string;
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl: boolean;
}

export interface RedisConfig {
  url?: string;
  host: string;
  port: number;
  password: string;
  db: number;
}

export const databaseConfig = registerAs('database', () => {
  const url = process.env.DATABASE_URL;
  const redisUrl = process.env.REDIS_URL;

  const postgres: PostgresConfig = {
    url,
    host: process.env.POSTGRES_HOST ?? 'localhost',
    port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
    user: process.env.POSTGRES_USER ?? 'rpfit',
    password: process.env.POSTGRES_PASSWORD ?? '',
    database: process.env.POSTGRES_DB ?? 'rpfit',
    ssl: process.env.POSTGRES_SSL === 'true',
  };

  const redis: RedisConfig = {
    url: redisUrl,
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD ?? '',
    db: parseInt(process.env.REDIS_DB ?? '0', 10),
  };

  return { postgres, redis };
});

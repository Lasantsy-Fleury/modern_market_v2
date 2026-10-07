import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Source de données dédiée à la CLI TypeORM (migrations).
 *
 * Règles :
 * - `synchronize` est TOUJOURS false ici : les évolutions de schéma passent
 *   par des migrations versionnées dans `src/migrations`.
 * - Les entités sont chargées via le même glob que l'application pour
 *   garantir que `migration:generate` reflète exactement le modèle cible.
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: Number(process.env.POSTGRES_PORT ?? 5432),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  entities: [__dirname + '/**/*.entity.{ts,js}'],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false,
  logging: ['error', 'warn'],
});

import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { DataSource, type DataSourceOptions } from 'typeorm';

loadEnv();

export function buildDataSourceOptions(databaseUrl: string): DataSourceOptions {
    return {
        type: 'postgres',
        url: databaseUrl,
        // Entities are registered here as each one is added.
        entities: [],
        migrations: [`${__dirname}/migrations/*.{ts,js}`],
        // Migrations are the source of truth; never let TypeORM mutate the schema.
        synchronize: false,
    };
}

/** Used by the TypeORM CLI for generating and running migrations. */
export default new DataSource(buildDataSourceOptions(process.env.DATABASE_URL ?? ''));

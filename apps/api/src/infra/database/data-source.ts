import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { DataSource, type DataSourceOptions } from 'typeorm';
import { Comment } from '../../modules/comments/comment.entity';
import { Deal } from '../../modules/deals/deal.entity';
import { Lead } from '../../modules/leads/lead.entity';
import { User } from '../../modules/users/user.entity';
import { SnakeNamingStrategy } from './snake-naming.strategy';

loadEnv();

export function buildDataSourceOptions(databaseUrl: string): DataSourceOptions {
    return {
        type: 'postgres',
        url: databaseUrl,
        // Entities are registered here as each one is added.
        entities: [User, Lead, Deal, Comment],
        migrations: [`${__dirname}/migrations/*.{ts,js}`],
        // Migrations are the source of truth; never let TypeORM mutate the schema.
        synchronize: false,
        namingStrategy: new SnakeNamingStrategy(),
    };
}

/** Used by the TypeORM CLI for generating and running migrations. */
export default new DataSource(buildDataSourceOptions(process.env.DATABASE_URL ?? ''));

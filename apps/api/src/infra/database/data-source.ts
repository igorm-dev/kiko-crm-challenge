import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { DataSource, type DataSourceOptions } from 'typeorm';
import { Comment } from '../../modules/comments/comment.entity';
import { Deal } from '../../modules/deals/deal.entity';
import { Lead } from '../../modules/leads/lead.entity';
import { User } from '../../modules/users/user.entity';
import { SnakeNamingStrategy } from './snake-naming.strategy';

loadEnv();

export function buildDataSourceOptions(databaseUrl: string, ssl = false): DataSourceOptions {
    return {
        type: 'postgres',
        url: databaseUrl,
        ssl: ssl ? { rejectUnauthorized: true } : false,
        entities: [User, Lead, Deal, Comment],
        migrations: [`${__dirname}/migrations/*.{ts,js}`],
        synchronize: false,
        namingStrategy: new SnakeNamingStrategy(),
    };
}

export default new DataSource(
    buildDataSourceOptions(process.env.DATABASE_URL ?? '', process.env.DATABASE_SSL === 'true'),
);

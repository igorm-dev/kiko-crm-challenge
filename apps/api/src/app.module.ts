import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validateEnv, type Env } from './infra/config/env';
import { buildDataSourceOptions } from './infra/database/data-source';
import { HealthModule } from './infra/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { CommentsModule } from './modules/comments/comments.module';
import { DealsModule } from './modules/deals/deals.module';
import { LeadsModule } from './modules/leads/leads.module';
import { UsersModule } from './modules/users/users.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validate: validateEnv,
        }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService<Env, true>) =>
                buildDataSourceOptions(
                    config.get('DATABASE_URL', { infer: true }),
                    config.get('DATABASE_SSL', { infer: true }),
                ),
        }),
        HealthModule,
        AuthModule,
        UsersModule,
        LeadsModule,
        DealsModule,
        CommentsModule,
    ],
})
export class AppModule {}

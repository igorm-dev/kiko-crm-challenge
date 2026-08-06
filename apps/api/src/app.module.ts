import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validateEnv, type Env } from './config/env';
import { buildDataSourceOptions } from './database/data-source';
import { HealthModule } from './health/health.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validate: validateEnv,
        }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService<Env, true>) =>
                buildDataSourceOptions(config.get('DATABASE_URL', { infer: true })),
        }),
        HealthModule,
    ],
})
export class AppModule {}

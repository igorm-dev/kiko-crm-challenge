import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import type { Env } from './infra/config/env';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);
    const config = app.get(ConfigService<Env, true>);

    app.setGlobalPrefix('api');
    app.enableCors({ origin: config.get('CORS_ORIGIN', { infer: true }), credentials: true });

    const port = config.get('PORT', { infer: true });
    await app.listen(port);

    console.log(`API listening on http://localhost:${port}/api`);
}

void bootstrap();

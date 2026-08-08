import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { HealthSchema, type Health } from '@kiko/contracts';
import { Public } from '../../modules/auth/decorators/public.decorator';

@Public()
@Controller('health')
export class HealthController {
    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
    ) {}

    @Get()
    async check(): Promise<Health> {
        let database: Health['database'] = 'down';

        try {
            await this.dataSource.query('SELECT 1');
            database = 'up';
        } catch {
            database = 'down';
        }

        return HealthSchema.parse({
            status: 'ok',
            database,
            timestamp: new Date(),
        });
    }
}

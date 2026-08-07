import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from './lead.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Lead])],
    exports: [TypeOrmModule],
})
export class LeadsModule {}
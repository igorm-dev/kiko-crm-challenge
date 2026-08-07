import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deal } from './deal.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Deal])],
    exports: [TypeOrmModule],
})
export class DealsModule {}
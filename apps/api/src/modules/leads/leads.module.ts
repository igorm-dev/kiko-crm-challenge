import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Lead } from './lead.entity';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';

@Module({
    imports: [TypeOrmModule.forFeature([Lead, User])],
    controllers: [LeadsController],
    providers: [LeadsService],
    exports: [TypeOrmModule],
})
export class LeadsModule {}

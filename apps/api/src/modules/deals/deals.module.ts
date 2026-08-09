import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from '../comments/comment.entity';
import { CommentsModule } from '../comments/comments.module';
import { Lead } from '../leads/lead.entity';
import { User } from '../users/user.entity';
import { Deal } from './deal.entity';
import { DealsController } from './deals.controller';
import { DealsService } from './deals.service';

@Module({
    imports: [TypeOrmModule.forFeature([Deal, Lead, User, Comment]), CommentsModule],
    controllers: [DealsController],
    providers: [DealsService],
    exports: [TypeOrmModule],
})
export class DealsModule {}

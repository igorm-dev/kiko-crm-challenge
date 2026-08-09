import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deal } from '../deals/deal.entity';
import { Comment } from './comment.entity';
import { CommentsService } from './comments.service';

@Module({
    imports: [TypeOrmModule.forFeature([Comment, Deal])],
    providers: [CommentsService],
    exports: [CommentsService, TypeOrmModule],
})
export class CommentsModule {}

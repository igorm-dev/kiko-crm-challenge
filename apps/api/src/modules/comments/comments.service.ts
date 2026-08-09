import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deal } from '../deals/deal.entity';
import { Comment } from './comment.entity';

@Injectable()
export class CommentsService {
    constructor(
        @InjectRepository(Comment)
        private readonly commentsRepository: Repository<Comment>,
        @InjectRepository(Deal)
        private readonly dealsRepository: Repository<Deal>,
    ) {}

    async findByDeal(dealId: string): Promise<Comment[]> {
        await this.assertDealExists(dealId);

        return this.commentsRepository
            .createQueryBuilder('comment')
            .withDeleted()
            .innerJoinAndSelect('comment.author', 'author')
            .where('comment.dealId = :dealId', { dealId })
            .andWhere('comment.deletedAt IS NULL')
            .orderBy('comment.createdAt', 'DESC')
            .getMany();
    }

    async create(dealId: string, authorId: string, content: string): Promise<Comment> {
        await this.assertDealExists(dealId);

        const saved = await this.commentsRepository.save(
            this.commentsRepository.create({ dealId, authorId, content, isSystemEvent: false }),
        );

        return this.commentsRepository
            .createQueryBuilder('comment')
            .withDeleted()
            .innerJoinAndSelect('comment.author', 'author')
            .where('comment.id = :id', { id: saved.id })
            .getOneOrFail();
    }

    private async assertDealExists(dealId: string): Promise<void> {
        const deal = await this.dealsRepository.findOne({ where: { id: dealId } });

        if (!deal) {
            throw new NotFoundException('Negócio não encontrado.');
        }
    }
}

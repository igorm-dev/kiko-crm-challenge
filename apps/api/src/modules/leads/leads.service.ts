import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import type { CreateLeadInput, LeadListQuery, Paginated, UpdateLeadInput } from '@kiko/contracts';
import { User } from '../users/user.entity';
import { Lead } from './lead.entity';

@Injectable()
export class LeadsService {
    constructor(
        @InjectRepository(Lead)
        private readonly leadsRepository: Repository<Lead>,
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}

    async findAll({
        page,
        pageSize,
        search,
        sellerId,
        view,
    }: LeadListQuery): Promise<Paginated<Lead>> {
        const query = this.leadsRepository
            .createQueryBuilder('lead')
            .withDeleted()
            .innerJoinAndSelect('lead.seller', 'seller')
            .andWhere('lead.deletedAt IS NULL')
            .orderBy('lead.createdAt', 'DESC')
            .skip((page - 1) * pageSize)
            .take(pageSize);

        if (view === 'active') {
            query.andWhere('lead.archivedAt IS NULL');
        }

        if (view === 'archived') {
            query.andWhere('lead.archivedAt IS NOT NULL');
        }

        if (sellerId) {
            query.andWhere('lead.sellerId = :sellerId', { sellerId });
        }

        if (search) {
            query.andWhere(
                new Brackets((where) => {
                    where
                        .where('lead.name ILIKE :search')
                        .orWhere('lead.companyName ILIKE :search')
                        .orWhere('lead.email ILIKE :search');
                }),
                { search: `%${search}%` },
            );
        }

        const [items, total] = await query.getManyAndCount();

        return {
            items,
            total,
            page,
            pageSize,
            pageCount: Math.ceil(total / pageSize),
        };
    }

    async findById(id: string): Promise<Lead> {
        const lead = await this.leadsRepository
            .createQueryBuilder('lead')
            .withDeleted()
            .innerJoinAndSelect('lead.seller', 'seller')
            .where('lead.id = :id', { id })
            .andWhere('lead.deletedAt IS NULL')
            .getOne();

        if (!lead) {
            throw new NotFoundException('Lead não encontrado.');
        }

        return lead;
    }

    async create(input: CreateLeadInput): Promise<Lead> {
        await this.assertSellerExists(input.sellerId);

        const saved = await this.leadsRepository.save(this.leadsRepository.create(input));

        return this.findById(saved.id);
    }

    async update(id: string, input: UpdateLeadInput): Promise<Lead> {
        await this.findById(id);

        if (input.sellerId) {
            await this.assertSellerExists(input.sellerId);
        }

        await this.leadsRepository.update(id, input);

        return this.findById(id);
    }

    async archive(id: string): Promise<Lead> {
        const lead = await this.findById(id);

        if (lead.archivedAt) {
            throw new ConflictException('Este lead já está arquivado.');
        }

        await this.leadsRepository.update(id, { archivedAt: new Date() });

        return this.findById(id);
    }

    async unarchive(id: string): Promise<Lead> {
        const lead = await this.findById(id);

        if (!lead.archivedAt) {
            throw new ConflictException('Este lead não está arquivado.');
        }

        await this.leadsRepository.update(id, { archivedAt: null });

        return this.findById(id);
    }

    private async assertSellerExists(sellerId: string): Promise<void> {
        const seller = await this.usersRepository.findOne({ where: { id: sellerId } });

        if (!seller) {
            throw new BadRequestException('Vendedor responsável não encontrado.');
        }
    }
}

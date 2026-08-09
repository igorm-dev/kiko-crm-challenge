import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository } from 'typeorm';
import {
    DEAL_STATUS_LABELS,
    DealStatus,
    type CreateDealInput,
    type DealListQuery,
    type Paginated,
    type UpdateDealInput,
    type PermissionActor,
} from '@kiko/contracts';
import { Comment } from '../comments/comment.entity';
import { Lead } from '../leads/lead.entity';
import { User } from '../users/user.entity';
import { assertCanAssign, assertCanManage, resolveOwnerId } from '../../shared/ownership';
import { Deal } from './deal.entity';

export interface DealWithLastContact extends Deal {
    lastContactAt: Date | null;
}

const CODE_PREFIX = 'KK';
const DEAL_CODE_LOCK = 4713;

@Injectable()
export class DealsService {
    constructor(
        @InjectRepository(Deal)
        private readonly dealsRepository: Repository<Deal>,
        @InjectRepository(Lead)
        private readonly leadsRepository: Repository<Lead>,
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        private readonly dataSource: DataSource,
    ) {}

    async findBoard(): Promise<{
        columns: { status: DealStatus; total: number; deals: DealWithLastContact[] }[];
    }> {
        const deals = await this.buildQuery().orderBy('deal.createdAt', 'DESC').getMany();
        const lastContacts = await this.loadLastContacts(deals.map((deal) => deal.id));

        const withContact = deals.map((deal) => ({
            ...deal,
            lastContactAt: lastContacts.get(deal.id) ?? null,
        })) as DealWithLastContact[];

        return {
            columns: Object.values(DealStatus).map((status) => {
                const columnDeals = withContact.filter((deal) => deal.status === status);
                return { status, total: columnDeals.length, deals: columnDeals };
            }),
        };
    }

    async findAll({
        page,
        pageSize,
        search,
        status,
        sellerId,
    }: DealListQuery): Promise<Paginated<DealWithLastContact>> {
        const query = this.buildQuery()
            .orderBy('deal.createdAt', 'DESC')
            .skip((page - 1) * pageSize)
            .take(pageSize);

        if (status) {
            query.andWhere('deal.status = :status', { status });
        }

        if (sellerId) {
            query.andWhere('deal.sellerId = :sellerId', { sellerId });
        }

        if (search) {
            query.andWhere(
                new Brackets((where) => {
                    where
                        .where('deal.name ILIKE :search')
                        .orWhere('deal.code ILIKE :search')
                        .orWhere('lead.name ILIKE :search');
                }),
                { search: `%${search}%` },
            );
        }

        const [deals, total] = await query.getManyAndCount();
        const lastContacts = await this.loadLastContacts(deals.map((deal) => deal.id));

        return {
            items: deals.map((deal) => ({
                ...deal,
                lastContactAt: lastContacts.get(deal.id) ?? null,
            })) as DealWithLastContact[],
            total,
            page,
            pageSize,
            pageCount: Math.ceil(total / pageSize),
        };
    }

    async findById(id: string): Promise<DealWithLastContact> {
        const deal = await this.buildQuery().andWhere('deal.id = :id', { id }).getOne();

        if (!deal) {
            throw new NotFoundException('Negócio não encontrado.');
        }

        const lastContacts = await this.loadLastContacts([deal.id]);

        return { ...deal, lastContactAt: lastContacts.get(deal.id) ?? null } as DealWithLastContact;
    }

    async create(input: CreateDealInput, actor: PermissionActor): Promise<DealWithLastContact> {
        const sellerId = resolveOwnerId(actor, input.sellerId);
        await this.assertRelationsExist(input.leadId, sellerId);

        const saved = await this.dataSource.transaction(async (manager) => {
            await manager.query('SELECT pg_advisory_xact_lock($1)', [DEAL_CODE_LOCK]);

            const deals = manager.getRepository(Deal);

            return deals.save(
                deals.create({ ...input, sellerId, code: await this.nextCode(deals) }),
            );
        });

        return this.findById(saved.id);
    }

    async update(
        id: string,
        input: UpdateDealInput,
        actor: PermissionActor,
    ): Promise<DealWithLastContact> {
        const deal = await this.findById(id);

        assertCanManage(
            actor,
            deal.sellerId,
            'Você só pode editar negócios sob a sua responsabilidade.',
        );
        assertCanAssign(actor, input.sellerId);
        await this.assertRelationsExist(input.leadId, input.sellerId);
        await this.dealsRepository.update(id, input);

        return this.findById(id);
    }

    async move(
        id: string,
        status: DealStatus,
        actor: PermissionActor,
    ): Promise<DealWithLastContact> {
        const deal = await this.findById(id);

        assertCanManage(
            actor,
            deal.sellerId,
            'Você só pode mover negócios sob a sua responsabilidade.',
        );

        if (deal.status === status) {
            return deal;
        }

        await this.dataSource.transaction(async (manager) => {
            await manager.getRepository(Deal).update(id, { status });
            await manager.getRepository(Comment).save(
                manager.getRepository(Comment).create({
                    dealId: id,
                    authorId: actor.id,
                    isSystemEvent: true,
                    content: `moveu de ${DEAL_STATUS_LABELS[deal.status]} para ${DEAL_STATUS_LABELS[status]}`,
                }),
            );
        });

        return this.findById(id);
    }

    private buildQuery() {
        return this.dealsRepository
            .createQueryBuilder('deal')
            .withDeleted()
            .innerJoinAndSelect('deal.lead', 'lead')
            .innerJoinAndSelect('deal.seller', 'seller')
            .where('deal.deletedAt IS NULL');
    }

    private async loadLastContacts(dealIds: string[]): Promise<Map<string, Date>> {
        if (dealIds.length === 0) {
            return new Map();
        }

        const rows = await this.dataSource
            .getRepository(Comment)
            .createQueryBuilder('comment')
            .select('comment.deal_id', 'dealId')
            .addSelect('MAX(comment.created_at)', 'lastContactAt')
            .where('comment.deal_id IN (:...dealIds)', { dealIds })
            .andWhere('comment.deleted_at IS NULL')
            .groupBy('comment.deal_id')
            .getRawMany<{ dealId: string; lastContactAt: Date }>();

        return new Map(rows.map((row) => [row.dealId, row.lastContactAt]));
    }

    private async nextCode(repository: Repository<Deal>): Promise<string> {
        const row = await repository
            .createQueryBuilder('deal')
            .withDeleted()
            .select('MAX(deal.code)', 'lastCode')
            .where('deal.code LIKE :prefix', { prefix: `${CODE_PREFIX}-%` })
            .getRawOne<{ lastCode: string | null }>();

        const last = Number(row?.lastCode?.split('-').at(1) ?? 0);

        return `${CODE_PREFIX}-${String(last + 1).padStart(4, '0')}`;
    }

    private async assertRelationsExist(leadId?: string, sellerId?: string): Promise<void> {
        if (leadId) {
            const lead = await this.leadsRepository.findOne({ where: { id: leadId } });

            if (!lead) {
                throw new BadRequestException('Lead não encontrado.');
            }
        }

        if (sellerId) {
            const seller = await this.usersRepository.findOne({ where: { id: sellerId } });

            if (!seller) {
                throw new BadRequestException('Vendedor responsável não encontrado.');
            }
        }
    }
}

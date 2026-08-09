import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import {
    CommentListSchema,
    CommentSchema,
    CreateCommentSchema,
    CreateDealSchema,
    DealBoardSchema,
    DealListQuerySchema,
    PaginatedDealsSchema,
    DealSchema,
    MoveDealSchema,
    UpdateDealSchema,
    type Comment,
    type CreateCommentInput,
    type CreateDealInput,
    type Deal,
    type DealBoard,
    type DealListQuery,
    type PaginatedDeals,
    type MoveDealInput,
    type UpdateDealInput,
} from '@kiko/contracts';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import { toActor } from '../../shared/ownership';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload';
import { CommentsService } from '../comments/comments.service';
import { DealsService } from './deals.service';

@Controller('deals')
export class DealsController {
    constructor(
        private readonly dealsService: DealsService,
        private readonly commentsService: CommentsService,
    ) {}

    @Get()
    async findAll(
        @Query(new ZodValidationPipe(DealListQuerySchema)) query: DealListQuery,
    ): Promise<PaginatedDeals> {
        return PaginatedDealsSchema.parse(await this.dealsService.findAll(query));
    }

    @Get('board')
    async board(): Promise<DealBoard> {
        return DealBoardSchema.parse(await this.dealsService.findBoard());
    }

    @Get(':id')
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Deal> {
        return DealSchema.parse(await this.dealsService.findById(id));
    }

    @Post()
    async create(
        @Body(new ZodValidationPipe(CreateDealSchema)) input: CreateDealInput,
        @CurrentUser() actor: JwtPayload,
    ): Promise<Deal> {
        return DealSchema.parse(await this.dealsService.create(input, toActor(actor)));
    }

    @Patch(':id')
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body(new ZodValidationPipe(UpdateDealSchema)) input: UpdateDealInput,
        @CurrentUser() actor: JwtPayload,
    ): Promise<Deal> {
        return DealSchema.parse(await this.dealsService.update(id, input, toActor(actor)));
    }

    @Post(':id/move')
    @HttpCode(HttpStatus.OK)
    async move(
        @Param('id', ParseUUIDPipe) id: string,
        @Body(new ZodValidationPipe(MoveDealSchema)) input: MoveDealInput,
        @CurrentUser() actor: JwtPayload,
    ): Promise<Deal> {
        return DealSchema.parse(await this.dealsService.move(id, input.status, toActor(actor)));
    }

    @Get(':id/comments')
    async comments(@Param('id', ParseUUIDPipe) id: string): Promise<Comment[]> {
        return CommentListSchema.parse(await this.commentsService.findByDeal(id));
    }

    @Post(':id/comments')
    async comment(
        @Param('id', ParseUUIDPipe) id: string,
        @Body(new ZodValidationPipe(CreateCommentSchema)) input: CreateCommentInput,
        @CurrentUser() author: JwtPayload,
    ): Promise<Comment> {
        return CommentSchema.parse(
            await this.commentsService.create(id, author.sub, input.content),
        );
    }
}

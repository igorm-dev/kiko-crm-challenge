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
    CreateLeadSchema,
    LeadListQuerySchema,
    LeadSchema,
    PaginatedLeadsSchema,
    UpdateLeadSchema,
    type CreateLeadInput,
    type Lead,
    type LeadListQuery,
    type PaginatedLeads,
    type UpdateLeadInput,
} from '@kiko/contracts';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import { toActor } from '../../shared/ownership';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload';
import { LeadsService } from './leads.service';

@Controller('leads')
export class LeadsController {
    constructor(private readonly leadsService: LeadsService) {}

    @Get()
    async findAll(
        @Query(new ZodValidationPipe(LeadListQuerySchema)) query: LeadListQuery,
    ): Promise<PaginatedLeads> {
        return PaginatedLeadsSchema.parse(await this.leadsService.findAll(query));
    }

    @Get(':id')
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Lead> {
        return LeadSchema.parse(await this.leadsService.findById(id));
    }

    @Post()
    async create(
        @Body(new ZodValidationPipe(CreateLeadSchema)) input: CreateLeadInput,
        @CurrentUser() actor: JwtPayload,
    ): Promise<Lead> {
        return LeadSchema.parse(await this.leadsService.create(input, toActor(actor)));
    }

    @Post(':id/archive')
    @HttpCode(HttpStatus.OK)
    async archive(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() actor: JwtPayload,
    ): Promise<Lead> {
        return LeadSchema.parse(await this.leadsService.archive(id, toActor(actor)));
    }

    @Post(':id/unarchive')
    @HttpCode(HttpStatus.OK)
    async unarchive(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() actor: JwtPayload,
    ): Promise<Lead> {
        return LeadSchema.parse(await this.leadsService.unarchive(id, toActor(actor)));
    }

    @Patch(':id')
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body(new ZodValidationPipe(UpdateLeadSchema)) input: UpdateLeadInput,
        @CurrentUser() actor: JwtPayload,
    ): Promise<Lead> {
        return LeadSchema.parse(await this.leadsService.update(id, input, toActor(actor)));
    }
}

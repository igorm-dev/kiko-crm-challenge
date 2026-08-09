import {
    Body,
    Controller,
    Delete,
    ForbiddenException,
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
    CreateUserSchema,
    GeneratedPasswordSchema,
    PaginatedUsersSchema,
    UpdateUserSchema,
    UserListQuerySchema,
    UserRole,
    UserSchema,
    type CreateUserInput,
    type GeneratedPassword,
    type PaginatedUsers,
    type UpdateUserInput,
    type User,
    type UserListQuery,
} from '@kiko/contracts';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import type { JwtPayload } from '../auth/jwt-payload';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    async findAll(
        @Query(new ZodValidationPipe(UserListQuerySchema)) query: UserListQuery,
    ): Promise<PaginatedUsers> {
        return PaginatedUsersSchema.parse(await this.usersService.findAll(query));
    }

    @Get(':id')
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
        return UserSchema.parse(await this.usersService.findById(id));
    }

    @Post()
    @Roles(UserRole.Admin)
    async create(
        @Body(new ZodValidationPipe(CreateUserSchema)) input: CreateUserInput,
    ): Promise<GeneratedPassword> {
        return GeneratedPasswordSchema.parse(await this.usersService.create(input));
    }

    @Patch(':id')
    @Roles(UserRole.Admin)
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body(new ZodValidationPipe(UpdateUserSchema)) input: UpdateUserInput,
    ): Promise<User> {
        return UserSchema.parse(await this.usersService.update(id, input));
    }

    @Post(':id/reset-password')
    @Roles(UserRole.Admin)
    @HttpCode(HttpStatus.OK)
    async resetPassword(@Param('id', ParseUUIDPipe) id: string): Promise<GeneratedPassword> {
        return GeneratedPasswordSchema.parse(await this.usersService.resetPassword(id));
    }

    @Post(':id/disable')
    @Roles(UserRole.Admin)
    @HttpCode(HttpStatus.OK)
    async disable(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() currentUser: JwtPayload,
    ): Promise<User> {
        if (id === currentUser.sub) {
            throw new ForbiddenException('Você não pode desabilitar o próprio usuário.');
        }

        return UserSchema.parse(await this.usersService.disable(id));
    }

    @Post(':id/enable')
    @Roles(UserRole.Admin)
    @HttpCode(HttpStatus.OK)
    async enable(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
        return UserSchema.parse(await this.usersService.enable(id));
    }

    @Delete(':id')
    @Roles(UserRole.Admin)
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() currentUser: JwtPayload,
    ): Promise<void> {
        if (id === currentUser.sub) {
            throw new ForbiddenException('Você não pode excluir o próprio usuário.');
        }

        await this.usersService.remove(id);
    }
}

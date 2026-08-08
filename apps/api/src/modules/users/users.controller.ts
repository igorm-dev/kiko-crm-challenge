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
} from '@nestjs/common';
import {
    CreateUserSchema,
    UpdateUserSchema,
    UserListSchema,
    UserRole,
    UserSchema,
    type CreateUserInput,
    type UpdateUserInput,
    type User,
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
    async findAll(): Promise<User[]> {
        return UserListSchema.parse(await this.usersService.findAll());
    }

    @Get(':id')
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
        return UserSchema.parse(await this.usersService.findById(id));
    }

    @Post()
    @Roles(UserRole.Admin)
    async create(
        @Body(new ZodValidationPipe(CreateUserSchema)) input: CreateUserInput,
    ): Promise<User> {
        return UserSchema.parse(await this.usersService.create(input));
    }

    @Patch(':id')
    @Roles(UserRole.Admin)
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body(new ZodValidationPipe(UpdateUserSchema)) input: UpdateUserInput,
    ): Promise<User> {
        return UserSchema.parse(await this.usersService.update(id, input));
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

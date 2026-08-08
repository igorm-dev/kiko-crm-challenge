import { Body, Controller, Get, HttpCode, HttpStatus, Post, UsePipes } from '@nestjs/common';
import {
    LoginSchema,
    UserSchema,
    type LoginInput,
    type LoginResponse,
    type User,
} from '@kiko/contracts';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import type { JwtPayload } from './jwt-payload';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ) {}

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodValidationPipe(LoginSchema))
    login(@Body() input: LoginInput): Promise<LoginResponse> {
        return this.authService.login(input);
    }

    @Get('me')
    async me(@CurrentUser() payload: JwtPayload): Promise<User> {
        return UserSchema.parse(await this.usersService.findById(payload.sub));
    }
}

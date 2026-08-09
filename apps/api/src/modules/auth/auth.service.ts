import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import {
    LoginResponseSchema,
    UserSchema,
    type LoginInput,
    type LoginResponse,
} from '@kiko/contracts';
import { UsersService } from '../users/users.service';
import type { JwtPayload } from './jwt-payload';

const DUMMY_HASH = '$2b$12$C6UzMDM.H6dfI/f/IKcEeO3Zx9Zr8QpKQwFvUvKzHqDMkNQeQb2Uy';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    async login({ email, password }: LoginInput): Promise<LoginResponse> {
        const user = await this.usersService.findByEmailWithPassword(email);

        const passwordMatches = await compare(password, user?.passwordHash ?? DUMMY_HASH);

        if (!user || !passwordMatches) {
            throw new UnauthorizedException('E-mail ou senha incorretos.');
        }

        if (user.disabledAt) {
            throw new UnauthorizedException(
                'Este acesso está desabilitado. Fale com o administrador do CRM.',
            );
        }

        const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };

        return LoginResponseSchema.parse({
            accessToken: await this.jwtService.signAsync(payload),
            user: UserSchema.parse(user),
        });
    }
}

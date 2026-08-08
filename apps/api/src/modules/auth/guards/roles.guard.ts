import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { UserRole } from '@kiko/contracts';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { AuthenticatedRequest } from '../jwt-payload';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!required?.length) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();

        if (!user || !required.includes(user.role)) {
            throw new ForbiddenException('Você não tem permissão para acessar este recurso.');
        }

        return true;
    }
}

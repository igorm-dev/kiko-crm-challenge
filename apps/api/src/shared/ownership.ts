import { ForbiddenException } from '@nestjs/common';
import { canAssignTo, canManage, resolveOwnerId, type PermissionActor } from '@kiko/contracts';
import type { JwtPayload } from '../modules/auth/jwt-payload';

export function toActor(payload: JwtPayload): PermissionActor {
    return { id: payload.sub, role: payload.role };
}

export function assertCanManage(actor: PermissionActor, ownerId: string, message: string): void {
    if (!canManage(actor, ownerId)) {
        throw new ForbiddenException(message);
    }
}

export function assertCanAssign(actor: PermissionActor, sellerId: string | undefined): void {
    if (sellerId && !canAssignTo(actor, sellerId)) {
        throw new ForbiddenException('Somente um administrador pode atribuir a outro vendedor.');
    }
}

export { resolveOwnerId };

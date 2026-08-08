import type { UserRole } from '@kiko/contracts';

export interface JwtPayload {
    sub: string;
    email: string;
    role: UserRole;
}

export interface AuthenticatedRequest {
    user?: JwtPayload;
}

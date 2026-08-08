import type { UserRole } from '@kiko/contracts';

/** The signed-in user as the UI needs it. Never carries the password hash. */
export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    jobTitle: string;
}

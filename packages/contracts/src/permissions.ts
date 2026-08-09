import { UserRole } from './enums';

export interface PermissionActor {
    id: string;
    role: UserRole;
}

export function isAdmin(actor: PermissionActor): boolean {
    return actor.role === UserRole.Admin;
}

export function canManage(actor: PermissionActor, ownerId: string): boolean {
    return isAdmin(actor) || actor.id === ownerId;
}

export function canAssignTo(actor: PermissionActor, sellerId: string): boolean {
    return isAdmin(actor) || sellerId === actor.id;
}

export function resolveOwnerId(actor: PermissionActor, requested: string): string {
    return isAdmin(actor) ? requested : actor.id;
}

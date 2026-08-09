import { canAssignTo, canManage, isAdmin, type PermissionActor } from '@kiko/contracts';
import { useAuth } from '@/hooks/useAuth';

interface Permissions {
    actor: PermissionActor | null;
    isAdmin: boolean;
    canManage: (ownerId: string) => boolean;
    canAssignTo: (sellerId: string) => boolean;
}

export function usePermissions(): Permissions {
    const { user } = useAuth();
    const actor = user ? { id: user.id, role: user.role } : null;

    return {
        actor,
        isAdmin: actor !== null && isAdmin(actor),
        canManage: (ownerId) => actor !== null && canManage(actor, ownerId),
        canAssignTo: (sellerId) => actor !== null && canAssignTo(actor, sellerId),
    };
}

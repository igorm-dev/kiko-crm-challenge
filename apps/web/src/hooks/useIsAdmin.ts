import { usePermissions } from '@/hooks/usePermissions';

export function useIsAdmin(): boolean {
    return usePermissions().isAdmin;
}

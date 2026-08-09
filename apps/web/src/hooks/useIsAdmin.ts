import { UserRole } from '@kiko/contracts';
import { useAuth } from '@/hooks/useAuth';

export function useIsAdmin(): boolean {
    const { user } = useAuth();

    return user?.role === UserRole.Admin;
}

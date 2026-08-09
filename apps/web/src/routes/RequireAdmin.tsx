import { Navigate, Outlet } from 'react-router-dom';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { ROUTES } from './paths';

export function RequireAdmin() {
    const isAdmin = useIsAdmin();

    if (!isAdmin) {
        return <Navigate to={ROUTES.sellers} replace />;
    }

    return <Outlet />;
}

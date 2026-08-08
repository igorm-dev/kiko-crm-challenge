import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { FullPageLoader } from '@/components/FullPageLoader';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from './paths';

export function RequireAuth() {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <FullPageLoader />;
    }

    if (!isAuthenticated) {
        return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />;
    }

    return <Outlet />;
}

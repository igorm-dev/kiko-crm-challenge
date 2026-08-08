import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ROUTES } from './paths';
import { useAuth } from '@/hooks/useAuth';

/** Layout route: renders the app only for signed-in users. */
export function RequireAuth() {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        // Carries the attempted path so login can send the user back to it.
        return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />;
    }

    return <Outlet />;
}

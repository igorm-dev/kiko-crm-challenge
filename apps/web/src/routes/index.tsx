import { useRoutes } from 'react-router-dom';
import { privateRoutes } from './private-routes';
import { publicRoutes } from './public-routes';

export { ROUTES } from './paths';
export type { RoutePath } from './paths';

/**
 * Public routes are matched first so a signed-out visitor always reaches
 * `/login`; the private branch ends in the catch-all.
 */
export function AppRoutes() {
    return useRoutes([...publicRoutes, ...privateRoutes]);
}

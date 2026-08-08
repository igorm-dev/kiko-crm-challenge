import { useRoutes } from 'react-router-dom';
import { privateRoutes } from './private-routes';
import { publicRoutes } from './public-routes';

export { ROUTES } from './paths';
export type { RoutePath } from './paths';

export function AppRoutes() {
    return useRoutes([...publicRoutes, ...privateRoutes]);
}

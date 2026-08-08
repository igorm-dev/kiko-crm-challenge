import type { RouteObject } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { RequireAuth } from './RequireAuth';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ROUTES } from './paths';

export const privateRoutes: RouteObject[] = [
    {
        element: <RequireAuth />,
        children: [
            {
                element: <AppLayout />,
                children: [
                    { path: ROUTES.home, element: <HomePage /> },

                    { path: '*', element: <NotFoundPage /> },
                ],
            },
        ],
    },
];

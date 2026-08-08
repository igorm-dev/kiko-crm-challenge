import type { RouteObject } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { RequireAuth } from './RequireAuth';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ROUTES } from './paths';

/**
 * Everything behind a session. Two nested layout routes wrap the whole branch:
 * `RequireAuth` decides *whether* it renders, `AppLayout` decides *how*.
 * New authenticated screens go in `children` — the guard comes for free.
 */
export const privateRoutes: RouteObject[] = [
    {
        element: <RequireAuth />,
        children: [
            {
                element: <AppLayout />,
                children: [
                    { path: ROUTES.home, element: <HomePage /> },

                    // Catch-all lives inside the guard on purpose: an unknown URL
                    // from a signed-out visitor should hit the login redirect, not
                    // reveal an app-shell 404.
                    { path: '*', element: <NotFoundPage /> },
                ],
            },
        ],
    },
];

import { Navigate, type RouteObject } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { DealsPage } from '@/pages/DealsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { SellersPage } from '@/pages/SellersPage';
import { EditLeadPage } from '@/pages/leads/EditLeadPage';
import { LeadsPage } from '@/pages/leads/LeadsPage';
import { NewLeadPage } from '@/pages/leads/NewLeadPage';
import { RequireAuth } from './RequireAuth';
import { ROUTES } from './paths';

export const privateRoutes: RouteObject[] = [
    {
        element: <RequireAuth />,
        children: [
            {
                element: <AppLayout />,
                children: [
                    { path: ROUTES.home, element: <Navigate to={ROUTES.leads} replace /> },
                    { path: ROUTES.dashboard, element: <DashboardPage /> },
                    { path: ROUTES.leads, element: <LeadsPage /> },
                    { path: ROUTES.newLead, element: <NewLeadPage /> },
                    { path: ROUTES.editLead, element: <EditLeadPage /> },
                    { path: ROUTES.deals, element: <DealsPage /> },
                    { path: ROUTES.sellers, element: <SellersPage /> },
                    { path: '*', element: <NotFoundPage /> },
                ],
            },
        ],
    },
];

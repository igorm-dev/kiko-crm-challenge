import { Navigate, type RouteObject } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { DealsPage } from '@/pages/DealsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { EditSellerPage } from '@/pages/sellers/EditSellerPage';
import { NewSellerPage } from '@/pages/sellers/NewSellerPage';
import { SellersPage } from '@/pages/sellers/SellersPage';
import { EditLeadPage } from '@/pages/leads/EditLeadPage';
import { LeadsPage } from '@/pages/leads/LeadsPage';
import { NewLeadPage } from '@/pages/leads/NewLeadPage';
import { RequireAdmin } from './RequireAdmin';
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
                    {
                        element: <RequireAdmin />,
                        children: [
                            { path: ROUTES.newSeller, element: <NewSellerPage /> },
                            { path: ROUTES.editSeller, element: <EditSellerPage /> },
                        ],
                    },
                    { path: '*', element: <NotFoundPage /> },
                ],
            },
        ],
    },
];

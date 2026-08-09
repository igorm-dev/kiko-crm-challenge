import { Navigate, type RouteObject } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';

import { BoardPage } from '@/pages/deals/BoardPage';
import { NewDealPage } from '@/pages/deals/NewDealPage';
import { DealDetailPage } from '@/pages/deals/DealDetailPage';
import { DealsListPage } from '@/pages/deals/DealsListPage';
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
                    { path: ROUTES.board, element: <BoardPage /> },
                    { path: ROUTES.leads, element: <LeadsPage /> },
                    { path: ROUTES.newLead, element: <NewLeadPage /> },
                    { path: ROUTES.editLead, element: <EditLeadPage /> },
                    { path: ROUTES.deals, element: <DealsListPage /> },
                    { path: ROUTES.newDeal, element: <NewDealPage /> },
                    { path: ROUTES.dealDetail, element: <DealDetailPage /> },
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

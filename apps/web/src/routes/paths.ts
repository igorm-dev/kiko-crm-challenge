export const ROUTES = {
    login: '/login',
    forgotPassword: '/recuperar-senha',
    home: '/',
    board: '/board',
    leads: '/leads',
    newLead: '/leads/novo',
    editLead: '/leads/:id/editar',
    deals: '/negocios',
    newDeal: '/negocios/novo',
    dealDetail: '/negocios/:id',
    sellers: '/vendedores',
    newSeller: '/vendedores/novo',
    editSeller: '/vendedores/:id/editar',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

export function dealDetailPath(id: string): string {
    return ROUTES.dealDetail.replace(':id', id);
}

export function editSellerPath(id: string): string {
    return ROUTES.editSeller.replace(':id', id);
}

export function editLeadPath(id: string): string {
    return ROUTES.editLead.replace(':id', id);
}

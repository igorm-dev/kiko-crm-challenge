export const ROUTES = {
    login: '/login',
    forgotPassword: '/recuperar-senha',
    home: '/',
    dashboard: '/dashboard',
    leads: '/leads',
    newLead: '/leads/novo',
    editLead: '/leads/:id/editar',
    deals: '/negocios',
    sellers: '/vendedores',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

export function editLeadPath(id: string): string {
    return ROUTES.editLead.replace(':id', id);
}

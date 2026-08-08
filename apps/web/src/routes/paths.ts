export const ROUTES = {
    login: '/login',
    forgotPassword: '/recuperar-senha',
    home: '/',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

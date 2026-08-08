/**
 * Single source of truth for every URL in the app. Import from here instead of
 * writing string literals — renaming a path then stays a one-line change, and
 * a typo becomes a type error instead of a silent 404.
 */
export const ROUTES = {
    login: '/login',
    forgotPassword: '/recuperar-senha',
    home: '/',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

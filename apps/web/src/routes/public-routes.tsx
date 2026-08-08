import type { RouteObject } from 'react-router-dom';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { LoginPage } from '@/pages/LoginPage';
import { ROUTES } from './paths';

/**
 * Reachable without a session. These render their own full-page shell instead
 * of `AppLayout` — there is no signed-in user to put in a header yet.
 */
export const publicRoutes: RouteObject[] = [
    { path: ROUTES.login, element: <LoginPage /> },
    { path: ROUTES.forgotPassword, element: <ForgotPasswordPage /> },
];

import type { RouteObject } from 'react-router-dom';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { LoginPage } from '@/pages/LoginPage';
import { ROUTES } from './paths';

export const publicRoutes: RouteObject[] = [
    { path: ROUTES.login, element: <LoginPage /> },
    { path: ROUTES.forgotPassword, element: <ForgotPasswordPage /> },
];

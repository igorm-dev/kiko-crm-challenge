import type { AuthUser } from '@/types/auth';

/**
 * Thrown while authentication has no backend. The message is user-facing —
 * the login form renders it as-is.
 */
export class AuthNotImplementedError extends Error {
    constructor() {
        super('O login ainda não está disponível: a autenticação depende da API.');
        this.name = 'AuthNotImplementedError';
    }
}

/**
 * Everything that talks to the auth endpoints lives here, so swapping the stub
 * below for the real call touches this file only.
 */
export async function login(_email: string, _password: string): Promise<AuthUser> {
    // TODO: apiMutate('/auth/login', AuthUserSchema, 'POST', { email, password })
    // Until that endpoint exists there is nothing to authenticate against,
    // so this fails loudly instead of faking a session.
    throw new AuthNotImplementedError();
}

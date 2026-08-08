import { LoginResponseSchema, UserSchema, type User } from '@kiko/contracts';
import { clearToken, setToken } from '@/lib/auth-storage';
import { apiFetch, apiMutate } from './api';

export async function login(email: string, password: string): Promise<User> {
    const { accessToken, user } = await apiMutate('/auth/login', LoginResponseSchema, 'POST', {
        email,
        password,
    });

    setToken(accessToken);
    return user;
}

export function getMe(): Promise<User> {
    return apiFetch('/auth/me', UserSchema);
}

export function logout(): void {
    clearToken();
}

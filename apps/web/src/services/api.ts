import type { ZodSchema } from 'zod';
import { clearToken, getToken } from '@/lib/auth-storage';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export const UNAUTHORIZED_EVENT = 'kiko:unauthorized';

export class ApiError extends Error {
    constructor(
        message: string,
        readonly status: number,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export async function apiFetch<T>(
    path: string,
    schema: ZodSchema<T>,
    init?: RequestInit,
): Promise<T> {
    const token = getToken();

    const response = await fetch(`${BASE_URL}${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...init?.headers,
        },
    });

    if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: string } | null;

        if (response.status === 401 && token) {
            clearToken();
            window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
        }

        throw new ApiError(body?.message ?? response.statusText, response.status);
    }

    return schema.parse(await response.json());
}

export function apiMutate<T>(
    path: string,
    schema: ZodSchema<T>,
    method: 'POST' | 'PATCH' | 'DELETE',
    body?: unknown,
): Promise<T> {
    return apiFetch(path, schema, {
        method,
        body: body === undefined ? undefined : JSON.stringify(body),
    });
}

import type { ZodSchema } from 'zod';

const BASE_URL = '/api';

export class ApiError extends Error {
    constructor(
        message: string,
        readonly status: number,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Parses every response through the same Zod schema the API validates with.
 * If the contract drifts, this throws here instead of producing `undefined`
 * three components deep.
 */
export async function apiFetch<T>(
    path: string,
    schema: ZodSchema<T>,
    init?: RequestInit,
): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...init?.headers,
        },
    });

    if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: string } | null;
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

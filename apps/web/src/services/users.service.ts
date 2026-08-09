import {
    GeneratedPasswordSchema,
    PaginatedUsersSchema,
    UserSchema,
    type CreateUserInput,
    type GeneratedPassword,
    type PaginatedUsers,
    type UpdateUserInput,
    type User,
    type UserListQuery,
} from '@kiko/contracts';
import { apiFetch, apiMutate } from './api';

export function listUsers(query: Partial<UserListQuery> = {}): Promise<PaginatedUsers> {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== '') {
            params.set(key, String(value));
        }
    }

    return apiFetch(`/users?${params.toString()}`, PaginatedUsersSchema);
}

export function getUser(id: string): Promise<User> {
    return apiFetch(`/users/${id}`, UserSchema);
}

export function createUser(input: CreateUserInput): Promise<GeneratedPassword> {
    return apiMutate('/users', GeneratedPasswordSchema, 'POST', input);
}

export function updateUser(id: string, input: UpdateUserInput): Promise<User> {
    return apiMutate(`/users/${id}`, UserSchema, 'PATCH', input);
}

export function resetUserPassword(id: string): Promise<GeneratedPassword> {
    return apiMutate(`/users/${id}/reset-password`, GeneratedPasswordSchema, 'POST');
}

export function disableUser(id: string): Promise<User> {
    return apiMutate(`/users/${id}/disable`, UserSchema, 'POST');
}

export function enableUser(id: string): Promise<User> {
    return apiMutate(`/users/${id}/enable`, UserSchema, 'POST');
}

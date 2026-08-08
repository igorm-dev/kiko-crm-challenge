import { UserListSchema, type User } from '@kiko/contracts';
import { apiFetch } from './api';

export function listUsers(): Promise<User[]> {
    return apiFetch('/users', UserListSchema);
}

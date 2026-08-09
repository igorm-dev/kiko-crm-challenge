import { z } from 'zod';
import { UserRole } from './enums';
import { paginated, PaginationQuerySchema } from './pagination';

export const UserSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    role: z.nativeEnum(UserRole),
    jobTitle: z.string(),
    disabledAt: z.coerce.date().nullable(),
    createdAt: z.coerce.date(),
});

export type User = z.infer<typeof UserSchema>;

export const PasswordSchema = z
    .string()
    .min(8, 'A senha deve ter ao menos 8 caracteres.')
    .max(72, 'A senha deve ter no máximo 72 caracteres.');

export const CreateUserSchema = z.object({
    name: z.string().trim().min(1, 'Informe o nome.').max(255),
    email: z.string().trim().toLowerCase().email('E-mail inválido.').max(255),
    role: z.nativeEnum(UserRole),
    jobTitle: z.string().trim().min(1, 'Informe o cargo.').max(255),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = CreateUserSchema.partial().refine(
    (value) => Object.keys(value).length > 0,
    { message: 'Informe ao menos um campo para atualizar.' },
);

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

export const GeneratedPasswordSchema = z.object({
    user: UserSchema,
    generatedPassword: z.string(),
});

export type GeneratedPassword = z.infer<typeof GeneratedPasswordSchema>;

export const USER_VIEWS = ['active', 'disabled', 'all'] as const;

export const UserViewSchema = z.enum(USER_VIEWS);

export type UserView = z.infer<typeof UserViewSchema>;

export const USER_VIEW_LABELS: Record<UserView, string> = {
    active: 'Ativos',
    disabled: 'Desabilitados',
    all: 'Todos',
};

export const UserListQuerySchema = PaginationQuerySchema.extend({
    search: z.string().trim().max(255).optional(),
    role: z.nativeEnum(UserRole).optional(),
    view: UserViewSchema.default('active'),
});

export type UserListQuery = z.infer<typeof UserListQuerySchema>;

export const PaginatedUsersSchema = paginated(UserSchema);

export type PaginatedUsers = z.infer<typeof PaginatedUsersSchema>;

export const UserListSchema = z.array(UserSchema);

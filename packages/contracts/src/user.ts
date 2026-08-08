import { z } from 'zod';
import { UserRole } from './enums';

export const UserSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    role: z.nativeEnum(UserRole),
    jobTitle: z.string(),
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
    password: PasswordSchema,
    role: z.nativeEnum(UserRole),
    jobTitle: z.string().trim().min(1, 'Informe o cargo.').max(255),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = CreateUserSchema.partial().refine(
    (value) => Object.keys(value).length > 0,
    { message: 'Informe ao menos um campo para atualizar.' },
);

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

export const UserListSchema = z.array(UserSchema);

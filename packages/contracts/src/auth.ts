import { z } from 'zod';
import { UserSchema } from './user';

export const LoginSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, 'Informe seu e-mail profissional.')
        .email('E-mail inválido.')
        .toLowerCase(),
    password: z.string().min(1, 'Informe sua senha.'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const LoginResponseSchema = z.object({
    accessToken: z.string(),
    user: UserSchema,
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

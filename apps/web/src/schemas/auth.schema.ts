import { z } from 'zod';

/**
 * Lives in the web app, not in `@kiko/contracts`, on purpose: there is no
 * `POST /api/auth/login` yet, so this is a form schema — not an API contract.
 * When the endpoint exists, this moves to `contracts` and both sides share it.
 */
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

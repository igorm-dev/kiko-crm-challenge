import { z } from 'zod';
import { DealStatus } from './enums';
import { paginated, PaginationQuerySchema } from './pagination';

export const DealStatusSchema = z.nativeEnum(DealStatus);

export const DealPartySchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
});

export const DealLeadSchema = DealPartySchema.extend({
    companyName: z.string(),
    email: z.string().email(),
    phone: z.string(),
});

export const DealSchema = z.object({
    id: z.string().uuid(),
    code: z.string(),
    name: z.string(),
    lead: DealLeadSchema,
    seller: DealPartySchema,
    estimatedValue: z.number(),
    expectedCloseDate: z.string().nullable(),
    description: z.string().nullable(),
    status: z.nativeEnum(DealStatus),
    lastContactAt: z.coerce.date().nullable(),
    createdAt: z.coerce.date(),
});

export type Deal = z.infer<typeof DealSchema>;

export const DealBoardColumnSchema = z.object({
    status: z.nativeEnum(DealStatus),
    total: z.number().int().min(0),
    deals: z.array(DealSchema),
});

export type DealBoardColumn = z.infer<typeof DealBoardColumnSchema>;

export const DealBoardSchema = z.object({
    columns: z.array(DealBoardColumnSchema),
});

export type DealBoard = z.infer<typeof DealBoardSchema>;

export const CreateDealSchema = z.object({
    name: z.string().trim().min(1, 'Informe o nome do negócio.').max(255),
    leadId: z.string().uuid('Selecione o lead.'),
    sellerId: z.string().uuid('Selecione o vendedor responsável.'),
    estimatedValue: z.coerce
        .number({ invalid_type_error: 'Informe um valor válido.' })
        .nonnegative('O valor não pode ser negativo.')
        .max(999_999_999_999, 'Valor acima do limite.'),
    expectedCloseDate: z
        .string()
        .trim()
        .nullish()
        .transform((value) => value || null)
        .refine((value) => value === null || /^\d{4}-\d{2}-\d{2}$/.test(value), 'Data inválida.'),
    description: z
        .string()
        .trim()
        .max(5000)
        .nullish()
        .transform((value) => value || null),
});

export type CreateDealInput = z.infer<typeof CreateDealSchema>;

export const UpdateDealSchema = CreateDealSchema.partial().refine(
    (value) => Object.keys(value).length > 0,
    { message: 'Informe ao menos um campo para atualizar.' },
);

export type UpdateDealInput = z.infer<typeof UpdateDealSchema>;

export const DealListQuerySchema = PaginationQuerySchema.extend({
    search: z.string().trim().max(255).optional(),
    status: z.nativeEnum(DealStatus).optional(),
    sellerId: z.string().uuid().optional(),
});

export type DealListQuery = z.infer<typeof DealListQuerySchema>;

export const PaginatedDealsSchema = paginated(DealSchema);

export type PaginatedDeals = z.infer<typeof PaginatedDealsSchema>;

export const MoveDealSchema = z.object({
    status: z.nativeEnum(DealStatus, {
        errorMap: () => ({ message: 'Situação inválida.' }),
    }),
});

export type MoveDealInput = z.infer<typeof MoveDealSchema>;

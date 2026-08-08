import { z } from 'zod';
import { LeadSource } from './enums';
import { paginated, PaginationQuerySchema } from './pagination';

export const LeadSellerSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
});

export const LeadSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    companyName: z.string(),
    roleTitle: z.string().nullable(),
    source: z.nativeEnum(LeadSource),
    email: z.string().email(),
    phone: z.string(),
    seller: LeadSellerSchema,
    observation: z.string().nullable(),
    lastInteraction: z.coerce.date().nullable(),
    archivedAt: z.coerce.date().nullable(),
    createdAt: z.coerce.date(),
});

export type Lead = z.infer<typeof LeadSchema>;

export const PaginatedLeadsSchema = paginated(LeadSchema);

export type PaginatedLeads = z.infer<typeof PaginatedLeadsSchema>;

const optionalText = (max: number) =>
    z
        .string()
        .trim()
        .max(max)
        .transform((value) => (value === '' ? null : value))
        .nullish()
        .transform((value) => value ?? null);

export const CreateLeadSchema = z.object({
    name: z.string().trim().min(1, 'Informe o nome completo.').max(255),
    companyName: z.string().trim().min(1, 'Informe a empresa.').max(255),
    email: z.string().trim().toLowerCase().email('E-mail inválido.').max(255),
    phone: z.string().trim().min(8, 'Informe um telefone válido.').max(32),
    roleTitle: optionalText(255),
    source: z.nativeEnum(LeadSource, { errorMap: () => ({ message: 'Selecione a origem.' }) }),
    sellerId: z.string().uuid('Selecione o vendedor responsável.'),
    observation: optionalText(5000),
});

export type CreateLeadInput = z.infer<typeof CreateLeadSchema>;

export const UpdateLeadSchema = CreateLeadSchema.partial().refine(
    (value) => Object.keys(value).length > 0,
    { message: 'Informe ao menos um campo para atualizar.' },
);

export type UpdateLeadInput = z.infer<typeof UpdateLeadSchema>;

export const LEAD_VIEWS = ['active', 'archived', 'all'] as const;

export const LeadViewSchema = z.enum(LEAD_VIEWS);

export type LeadView = z.infer<typeof LeadViewSchema>;

export const LEAD_VIEW_LABELS: Record<LeadView, string> = {
    active: 'Ativos',
    archived: 'Arquivados',
    all: 'Todos',
};

export const LeadListQuerySchema = PaginationQuerySchema.extend({
    search: z.string().trim().max(255).optional(),
    sellerId: z.string().uuid().optional(),
    view: LeadViewSchema.default('active'),
});

export type LeadListQuery = z.infer<typeof LeadListQuerySchema>;

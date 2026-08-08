import { z } from 'zod';

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

export const PaginationQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export function paginated<T extends z.ZodTypeAny>(itemSchema: T) {
    return z.object({
        items: z.array(itemSchema),
        total: z.number().int().min(0),
        page: z.number().int().min(1),
        pageSize: z.number().int().min(1),
        pageCount: z.number().int().min(0),
    });
}

export interface Paginated<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
}

import { z } from 'zod';

/**
 * Placeholder contract. It exists so the shared-schema wiring between API and
 * web is proven end to end before any domain entity is written — the API
 * validates its response with this schema and the web app parses with it.
 */
export const HealthSchema = z.object({
    status: z.literal('ok'),
    database: z.enum(['up', 'down']),
    timestamp: z.coerce.date(),
});

export type Health = z.infer<typeof HealthSchema>;

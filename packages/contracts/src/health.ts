import { z } from 'zod';

export const HealthSchema = z.object({
    status: z.literal('ok'),
    database: z.enum(['up', 'down']),
    timestamp: z.coerce.date(),
});

export type Health = z.infer<typeof HealthSchema>;

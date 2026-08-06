import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import type { ZodSchema } from 'zod';

/**
 * Validates a request payload against a schema from @kiko/contracts.
 * Because the frontend derives its types from the same schema, a contract
 * change breaks the web build instead of failing silently at runtime.
 */
@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
    constructor(private readonly schema: ZodSchema<T>) {}

    transform(value: unknown): T {
        const result = this.schema.safeParse(value);

        if (!result.success) {
            throw new BadRequestException({
                message: 'Validation failed',
                errors: result.error.issues.map((issue) => ({
                    path: issue.path.join('.'),
                    message: issue.message,
                })),
            });
        }

        return result.data;
    }
}

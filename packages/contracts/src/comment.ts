import { z } from 'zod';

export const CommentAuthorSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
});

export const CommentSchema = z.object({
    id: z.string().uuid(),
    content: z.string(),
    author: CommentAuthorSchema,
    isSystemEvent: z.boolean(),
    createdAt: z.coerce.date(),
});

export type Comment = z.infer<typeof CommentSchema>;

export const CommentListSchema = z.array(CommentSchema);

export const CreateCommentSchema = z.object({
    content: z.string().trim().min(1, 'Escreva um comentário.').max(5000),
});

export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;

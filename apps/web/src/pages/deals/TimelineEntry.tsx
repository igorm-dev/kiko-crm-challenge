import { MessageSquare, Zap } from 'lucide-react';
import type { Comment } from '@kiko/contracts';
import { cn } from '@/lib/utils';
import { formatRelativeDateTime, initialsOf } from '@/lib/format';

interface TimelineEntryProps {
    comment: Comment;
    withIcon?: boolean;
}

export function TimelineEntry({ comment, withIcon = false }: TimelineEntryProps) {
    const { isSystemEvent } = comment;

    return (
        <div className="flex gap-3">
            {withIcon && (
                <span
                    className={cn(
                        'mt-1 flex size-7 shrink-0 items-center justify-center rounded-full border',
                        isSystemEvent
                            ? 'border-primary/50 text-primary'
                            : 'border-border text-muted-foreground',
                    )}
                    aria-hidden
                >
                    {isSystemEvent ? (
                        <Zap className="size-3.5" />
                    ) : (
                        <MessageSquare className="size-3.5" />
                    )}
                </span>
            )}

            <article
                className={cn(
                    'flex-1 rounded-lg border px-3 py-2.5',
                    isSystemEvent
                        ? 'border-dashed border-border bg-transparent'
                        : 'border-border bg-secondary/40',
                )}
            >
                <header className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-xs font-semibold">
                        {!withIcon && (
                            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground">
                                {initialsOf(comment.author.name)}
                            </span>
                        )}
                        {comment.author.name}
                        {isSystemEvent && (
                            <span className="text-[10px] font-bold tracking-wider text-primary">
                                SISTEMA
                            </span>
                        )}
                    </span>

                    <time className="text-[11px] text-muted-foreground">
                        {formatRelativeDateTime(comment.createdAt)}
                    </time>
                </header>

                <p
                    className={cn(
                        'mt-2 text-xs',
                        isSystemEvent ? 'text-muted-foreground italic' : 'text-foreground',
                    )}
                >
                    {comment.content}
                </p>
            </article>
        </div>
    );
}

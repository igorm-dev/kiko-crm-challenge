import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, User as UserIcon } from 'lucide-react';
import type { Deal } from '@kiko/contracts';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/usePermissions';
import { formatCurrency, initialsOf } from '@/lib/format';

interface DealCardProps {
    deal: Deal;
    isSelected: boolean;
    onSelect: () => void;
}

export function DealCard({ deal, isSelected, onSelect }: DealCardProps) {
    const { canManage } = usePermissions();
    const canMove = canManage(deal.seller.id);

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: deal.id,
        disabled: !canMove,
    });

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Translate.toString(transform) }}
            className={cn(
                'rounded-xl border bg-card p-4 transition-colors',
                isDragging && 'z-50 opacity-80 shadow-2xl',
                isSelected ? 'border-primary' : 'border-border hover:border-muted-foreground/40',
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <button
                    type="button"
                    onClick={onSelect}
                    className="flex-1 rounded-sm text-left text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                    {deal.name}
                </button>

                {canMove && (
                    <button
                        type="button"
                        {...listeners}
                        {...attributes}
                        aria-label={`Mover ${deal.name}`}
                        className="cursor-grab rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:cursor-grabbing"
                    >
                        <GripVertical className="size-4" />
                    </button>
                )}
            </div>

            <p className="mt-2 text-lg font-bold text-primary">
                {formatCurrency(deal.estimatedValue)}
            </p>

            <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span className="flex min-w-0 items-center gap-1.5">
                    <UserIcon className="size-3.5 shrink-0" />
                    <span className="truncate">{deal.lead.name}</span>
                </span>

                <span className="flex shrink-0 items-center gap-1.5">
                    <span className="truncate">{deal.seller.name}</span>
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground">
                        {initialsOf(deal.seller.name)}
                    </span>
                </span>
            </div>
        </div>
    );
}

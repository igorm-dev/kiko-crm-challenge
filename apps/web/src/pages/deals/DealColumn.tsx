import { useDroppable } from '@dnd-kit/core';
import { DEAL_STATUS_LABELS, type Deal, type DealStatus } from '@kiko/contracts';
import { cn } from '@/lib/utils';
import { DealCard } from './DealCard';

const DOT_BY_STATUS: Record<DealStatus, string> = {
    new: 'bg-sky-400',
    in_progress: 'bg-amber-400',
    won: 'bg-emerald-400',
    lost: 'bg-red-500',
};

interface DealColumnProps {
    status: DealStatus;
    total: number;
    deals: Deal[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}

export function DealColumn({ status, total, deals, selectedId, onSelect }: DealColumnProps) {
    const { setNodeRef, isOver } = useDroppable({ id: status });

    return (
        <section className="flex min-w-64 flex-1 flex-col">
            <header className="flex items-center justify-between gap-2 border-b border-border pb-3">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                    <span className={cn('size-2 rounded-full', DOT_BY_STATUS[status])} />
                    {DEAL_STATUS_LABELS[status]}
                </h2>
                <span className="rounded bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground">
                    {total}
                </span>
            </header>

            <div
                ref={setNodeRef}
                className={cn(
                    'mt-4 flex min-h-40 flex-col gap-3 rounded-xl border border-dashed p-1 transition-colors',
                    isOver ? 'border-primary bg-primary/5' : 'border-transparent',
                )}
            >
                {deals.map((deal) => (
                    <DealCard
                        key={deal.id}
                        deal={deal}
                        isSelected={deal.id === selectedId}
                        onSelect={() => onSelect(deal.id)}
                    />
                ))}

                {deals.length === 0 && (
                    <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                        Nenhum negócio aqui.
                    </p>
                )}
            </div>
        </section>
    );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { DealStatusSchema, type DealBoard, type DealStatus } from '@kiko/contracts';
import { Button } from '@/components/ui/button';
import { getBoard, moveDeal } from '@/services/deals.service';
import { ROUTES } from '@/routes/paths';
import { DealColumn } from './DealColumn';
import { DealDetailPanel } from './DealDetailPanel';

const BOARD_KEY = ['deals', 'board'];

export function BoardPage() {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const board = useQuery({ queryKey: BOARD_KEY, queryFn: getBoard, staleTime: 0 });

    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

    const moving = useMutation({
        mutationFn: ({ id, status }: { id: string; status: DealStatus }) => moveDeal(id, status),
        onMutate: async ({ id, status }) => {
            await queryClient.cancelQueries({ queryKey: BOARD_KEY });
            const previous = queryClient.getQueryData<DealBoard>(BOARD_KEY);

            queryClient.setQueryData<DealBoard>(BOARD_KEY, (current) =>
                current ? moveDealInBoard(current, id, status) : current,
            );

            return { previous };
        },
        onError: (error: Error, _variables, context) => {
            queryClient.setQueryData(BOARD_KEY, context?.previous);
            toast.error(error.message);
        },
        onSettled: (_data, _error, variables) =>
            Promise.all([
                queryClient.invalidateQueries({ queryKey: BOARD_KEY }),
                queryClient.invalidateQueries({ queryKey: ['deal', variables.id] }),
            ]),
    });

    function handleDragEnd({ active, over }: DragEndEvent) {
        if (!over) {
            return;
        }

        const status = DealStatusSchema.safeParse(over.id);
        const current = board.data?.columns.find((column) =>
            column.deals.some((deal) => deal.id === active.id),
        );

        if (!status.success || current?.status === status.data) {
            return;
        }

        moving.mutate({ id: String(active.id), status: status.data });
    }

    return (
        <div className="flex min-h-0 flex-1">
            <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-8 py-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Pipeline de Vendas</h1>
                        <p className="text-sm text-muted-foreground">
                            Acompanhamento de negociações ativas
                        </p>
                    </div>

                    <Button asChild size="lg" className="h-10">
                        <Link to={ROUTES.newDeal}>
                            <Plus />
                            Novo Negócio
                        </Link>
                    </Button>
                </header>

                <div className="min-h-0 flex-1 overflow-x-auto p-8">
                    {board.isPending && (
                        <div role="status" className="flex justify-center py-24">
                            <Loader2 className="size-9 animate-spin text-primary" aria-hidden />
                            <span className="sr-only">Carregando pipeline…</span>
                        </div>
                    )}

                    {board.isError && (
                        <p role="alert" className="text-sm text-destructive">
                            Não foi possível carregar o pipeline: {board.error.message}
                        </p>
                    )}

                    {board.data && (
                        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                            <div className="flex min-w-max gap-6">
                                {board.data.columns.map((column) => (
                                    <DealColumn
                                        key={column.status}
                                        status={column.status}
                                        total={column.total}
                                        deals={column.deals}
                                        selectedId={selectedId}
                                        onSelect={setSelectedId}
                                    />
                                ))}
                            </div>
                        </DndContext>
                    )}
                </div>
            </div>

            {selectedId && (
                <DealDetailPanel dealId={selectedId} onClose={() => setSelectedId(null)} />
            )}
        </div>
    );
}

function moveDealInBoard(board: DealBoard, dealId: string, status: DealStatus): DealBoard {
    const moved = board.columns
        .flatMap((column) => column.deals)
        .find((deal) => deal.id === dealId);

    if (!moved) {
        return board;
    }

    const columns = board.columns.map((column) => {
        const deals = column.deals.filter((deal) => deal.id !== dealId);

        if (column.status === status) {
            deals.unshift({ ...moved, status });
        }

        return { ...column, deals, total: deals.length };
    });

    return { columns };
}

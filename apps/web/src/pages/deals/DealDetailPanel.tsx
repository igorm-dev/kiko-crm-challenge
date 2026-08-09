import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowUpRight, ExternalLink, Loader2, MessageSquare, X } from 'lucide-react';
import { toast } from 'sonner';
import { DEAL_STATUS_LABELS } from '@kiko/contracts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate, formatRelativeDateTime } from '@/lib/format';
import { createComment, getDeal, listComments } from '@/services/deals.service';
import { dealDetailPath } from '@/routes/paths';
import { TimelineEntry } from './TimelineEntry';

const COMMENTS_POLL_MS = 5000;

interface DealDetailPanelProps {
    dealId: string;
    onClose: () => void;
}

export function DealDetailPanel({ dealId, onClose }: DealDetailPanelProps) {
    const [content, setContent] = useState('');
    const queryClient = useQueryClient();

    const deal = useQuery({
        queryKey: ['deal', dealId],
        queryFn: () => getDeal(dealId),
        refetchInterval: COMMENTS_POLL_MS,
        staleTime: 0,
    });

    const comments = useQuery({
        queryKey: ['deal', dealId, 'comments'],
        queryFn: () => listComments(dealId),
        refetchInterval: COMMENTS_POLL_MS,
        staleTime: 0,
    });

    const commenting = useMutation({
        mutationFn: (text: string) => createComment(dealId, text),
        onSuccess: async () => {
            setContent('');
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['deal', dealId] }),
                queryClient.invalidateQueries({ queryKey: ['deals', 'board'] }),
            ]);
        },
        onError: (error: Error) => toast.error(error.message),
    });

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (content.trim() !== '') {
            commenting.mutate(content);
        }
    }

    return (
        <aside className="flex w-96 shrink-0 flex-col border-l border-border bg-card">
            <header className="flex items-center justify-between gap-2 border-b border-border px-6 py-5">
                <h2 className="font-semibold">Detalhes do Negócio</h2>

                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" asChild>
                        <Link to={dealDetailPath(dealId)}>
                            Ver detalhes
                            <ExternalLink />
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={onClose}
                        aria-label="Fechar painel"
                    >
                        <X />
                    </Button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-5">
                {deal.isPending && (
                    <div role="status" className="flex justify-center py-16">
                        <Loader2 className="size-7 animate-spin text-primary" aria-hidden />
                        <span className="sr-only">Carregando negócio…</span>
                    </div>
                )}

                {deal.data && (
                    <>
                        <h3 className="text-xl font-bold">{deal.data.name}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">ID: #{deal.data.code}</p>

                        <div className="mt-5 flex items-center justify-between gap-3 rounded-lg border border-border bg-secondary/40 px-4 py-3">
                            <div>
                                <p className="text-xs text-muted-foreground">Valor Total</p>
                                <p className="text-xl font-bold text-primary">
                                    {formatCurrency(deal.data.estimatedValue)}
                                </p>
                            </div>
                            <span className="rounded-full border border-primary/40 px-2.5 py-1 text-xs text-primary">
                                {DEAL_STATUS_LABELS[deal.data.status]}
                            </span>
                        </div>

                        <dl className="mt-5 grid gap-3 text-sm">
                            <Field label="Lead" value={deal.data.lead.name} />
                            <Field label="Vendedor Responsável" value={deal.data.seller.name} />
                            <Field label="Criado em" value={formatDate(deal.data.createdAt)} />
                            <Field
                                label="Último Contato"
                                value={
                                    deal.data.lastContactAt
                                        ? formatRelativeDateTime(deal.data.lastContactAt)
                                        : '—'
                                }
                            />
                        </dl>

                        <h4 className="mt-7 flex items-center gap-2 border-t border-border pt-5 text-sm font-semibold">
                            <MessageSquare className="size-4" />
                            Comentários &amp; Histórico
                        </h4>

                        <div className="mt-4 grid gap-3">
                            {comments.data?.map((comment) => (
                                <TimelineEntry key={comment.id} comment={comment} />
                            ))}

                            {comments.data?.length === 0 && (
                                <p className="text-xs text-muted-foreground">
                                    Nenhum comentário ainda.
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>

            <form onSubmit={handleSubmit} className="border-t border-border p-4">
                <div className="relative">
                    <Input
                        value={content}
                        onChange={(event) => setContent(event.currentTarget.value)}
                        placeholder="Escreva um comentário..."
                        aria-label="Escreva um comentário"
                        disabled={commenting.isPending}
                        className="h-11 pr-12"
                    />
                    <Button
                        type="submit"
                        size="icon-sm"
                        disabled={commenting.isPending || content.trim() === ''}
                        aria-label="Enviar comentário"
                        className="absolute top-1/2 right-2 -translate-y-1/2"
                    >
                        {commenting.isPending ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <ArrowUpRight />
                        )}
                    </Button>
                </div>
            </form>
        </aside>
    );
}

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="text-right font-medium">{value}</dd>
        </div>
    );
}

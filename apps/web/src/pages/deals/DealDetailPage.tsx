import { useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { DEAL_STATUS_LABELS, DealStatus } from '@kiko/contracts';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PageHeader } from '@/components/layouts/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate } from '@/lib/format';
import { usePermissions } from '@/hooks/usePermissions';
import { createComment, getDeal, listComments, moveDeal } from '@/services/deals.service';
import { TimelineEntry } from './TimelineEntry';

const POLL_MS = 5000;

export function DealDetailPage() {
    const { id = '' } = useParams();
    const [content, setContent] = useState('');
    const queryClient = useQueryClient();
    const { canManage } = usePermissions();

    const deal = useQuery({
        queryKey: ['deal', id],
        queryFn: () => getDeal(id),
        enabled: id !== '',
        refetchInterval: POLL_MS,
        staleTime: 0,
    });

    const comments = useQuery({
        queryKey: ['deal', id, 'comments'],
        queryFn: () => listComments(id),
        enabled: id !== '',
        refetchInterval: POLL_MS,
        staleTime: 0,
    });

    function invalidate() {
        return Promise.all([
            queryClient.invalidateQueries({ queryKey: ['deal', id] }),
            queryClient.invalidateQueries({ queryKey: ['deals'] }),
        ]);
    }

    const moving = useMutation({
        mutationFn: (status: DealStatus) => moveDeal(id, status),
        onSuccess: async (updated) => {
            await invalidate();
            toast.success(`Negócio marcado como ${DEAL_STATUS_LABELS[updated.status]}.`);
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const commenting = useMutation({
        mutationFn: (text: string) => createComment(id, text),
        onSuccess: async () => {
            setContent('');
            await invalidate();
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
        <div>
            <PageHeader title={deal.data?.name ?? 'Negócio'} />

            <div className="p-8">
                {deal.isPending && (
                    <div role="status" className="flex justify-center py-24">
                        <Loader2 className="size-9 animate-spin text-primary" aria-hidden />
                        <span className="sr-only">Carregando negócio…</span>
                    </div>
                )}

                {deal.isError && (
                    <p
                        role="alert"
                        className="max-w-3xl rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                    >
                        Não foi possível carregar o negócio: {deal.error.message}
                    </p>
                )}

                {deal.data && (
                    <div className="grid gap-6 xl:grid-cols-2">
                        <div className="grid content-start gap-6">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between gap-3">
                                        <span className="font-mono text-xs text-muted-foreground">
                                            #{deal.data.code}
                                        </span>
                                        <span className="rounded-full border border-primary/40 px-2.5 py-1 text-xs text-primary">
                                            {DEAL_STATUS_LABELS[deal.data.status]}
                                        </span>
                                    </div>

                                    <h2 className="mt-3 text-xl font-bold">{deal.data.name}</h2>

                                    <div className="mt-5 rounded-lg border border-border bg-secondary/40 px-4 py-3">
                                        <p className="text-xs text-muted-foreground">
                                            Valor Proposto
                                        </p>
                                        <p className="text-2xl font-bold text-primary">
                                            {formatCurrency(deal.data.estimatedValue)}
                                        </p>
                                    </div>

                                    {canManage(deal.data.seller.id) ? (
                                        <div className="mt-5 grid grid-cols-2 gap-3">
                                            <OutcomeButton
                                                label="Marcar Ganho"
                                                dealName={deal.data.name}
                                                status={DealStatus.Won}
                                                isPending={moving.isPending}
                                                onConfirm={() => moving.mutate(DealStatus.Won)}
                                                className="border-emerald-600/50 text-emerald-400 hover:bg-emerald-600/10"
                                            />
                                            <OutcomeButton
                                                label="Perdido"
                                                dealName={deal.data.name}
                                                status={DealStatus.Lost}
                                                isPending={moving.isPending}
                                                onConfirm={() => moving.mutate(DealStatus.Lost)}
                                                className="border-destructive/50 text-destructive hover:bg-destructive/10"
                                            />
                                        </div>
                                    ) : (
                                        <p className="mt-5 rounded-lg border border-dashed border-border px-4 py-3 text-xs text-muted-foreground">
                                            Este negócio está sob responsabilidade de{' '}
                                            <span className="font-medium text-foreground">
                                                {deal.data.seller.name}
                                            </span>
                                            . Você pode acompanhar e comentar, mas só o responsável
                                            ou um administrador altera a situação.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Dossiê do Cliente &amp; Contatos</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <dl className="grid gap-3 text-sm">
                                        <Field
                                            label="Lead Responsável"
                                            value={deal.data.lead.name}
                                        />
                                        <Field label="Empresa" value={deal.data.lead.companyName} />
                                        <Field label="Telefone" value={deal.data.lead.phone} />
                                        <Field
                                            label="E-mail Corporativo"
                                            value={deal.data.lead.email}
                                        />
                                        <Field
                                            label="Vendedor Proprietário"
                                            value={deal.data.seller.name}
                                        />
                                        <Field
                                            label="Data Prevista Fechamento"
                                            value={
                                                deal.data.expectedCloseDate
                                                    ? formatDate(
                                                          new Date(
                                                              `${deal.data.expectedCloseDate}T00:00:00`,
                                                          ),
                                                      )
                                                    : '—'
                                            }
                                        />
                                    </dl>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="flex flex-col">
                            <CardHeader>
                                <CardTitle>Linha do Tempo de Atividades</CardTitle>
                            </CardHeader>

                            <CardContent className="flex min-h-0 flex-1 flex-col">
                                <div className="grid flex-1 content-start gap-4">
                                    {comments.data?.map((comment) => (
                                        <TimelineEntry
                                            key={comment.id}
                                            comment={comment}
                                            withIcon
                                        />
                                    ))}

                                    {comments.data?.length === 0 && (
                                        <p className="text-xs text-muted-foreground">
                                            Nenhuma atividade registrada ainda.
                                        </p>
                                    )}
                                </div>

                                <form onSubmit={handleSubmit} className="mt-6">
                                    <div className="relative">
                                        <Input
                                            value={content}
                                            onChange={(event) =>
                                                setContent(event.currentTarget.value)
                                            }
                                            placeholder="Escreva um comentário ou atualize as tratativas..."
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
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}

interface OutcomeButtonProps {
    label: string;
    dealName: string;
    status: DealStatus;
    isPending: boolean;
    className: string;
    onConfirm: () => void;
}

function OutcomeButton({
    label,
    dealName,
    status,
    isPending,
    className,
    onConfirm,
}: OutcomeButtonProps) {
    return (
        <ConfirmDialog
            title={`Marcar "${dealName}" como ${DEAL_STATUS_LABELS[status]}?`}
            description="A situação muda no pipeline e a alteração fica registrada na linha do tempo, com o seu nome. Você pode mover o negócio de volta depois."
            confirmLabel={label}
            isPending={isPending}
            onConfirm={onConfirm}
            trigger={
                <Button
                    variant="outline"
                    size="lg"
                    className={`h-10 ${className}`}
                    disabled={isPending}
                >
                    {label}
                </Button>
            }
        />
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

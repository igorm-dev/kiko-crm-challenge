import { useState } from 'react';
import { Link } from 'react-router-dom';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Archive,
    ArchiveRestore,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Plus,
    Search,
} from 'lucide-react';
import {
    DEFAULT_PAGE_SIZE,
    LEAD_VIEW_LABELS,
    LEAD_VIEWS,
    LeadViewSchema,
    type Lead,
    type LeadView,
} from '@kiko/contracts';
import { AsyncCombobox, COMBOBOX_PAGE_SIZE } from '@/components/AsyncCombobox';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PageHeader } from '@/components/layouts/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { usePermissions } from '@/hooks/usePermissions';
import { archiveLead, listLeads, unarchiveLead } from '@/services/leads.service';
import { listUsers } from '@/services/users.service';
import { editLeadPath, ROUTES } from '@/routes/paths';

const ALL_SELLERS = 'all';

export function LeadsPage() {
    const [search, setSearch] = useState('');
    const [sellerId, setSellerId] = useState(ALL_SELLERS);
    const [view, setView] = useState<LeadView>('active');
    const [page, setPage] = useState(1);

    const debouncedSearch = useDebouncedValue(search, 350);
    const queryClient = useQueryClient();
    const { canManage } = usePermissions();

    const leads = useQuery({
        queryKey: ['leads', { page, search: debouncedSearch, sellerId, view }],
        queryFn: () =>
            listLeads({
                page,
                pageSize: DEFAULT_PAGE_SIZE,
                search: debouncedSearch || undefined,
                sellerId: sellerId === ALL_SELLERS ? undefined : sellerId,
                view,
            }),
        placeholderData: keepPreviousData,
        staleTime: 0,
    });

    const archiving = useMutation({
        mutationFn: ({ id, archived }: { id: string; archived: boolean }) =>
            archived ? unarchiveLead(id) : archiveLead(id),
        onSuccess: async (lead) => {
            await queryClient.invalidateQueries({ queryKey: ['leads'] });
            toast.success(
                lead.archivedAt
                    ? `"${lead.name}" foi arquivado.`
                    : `"${lead.name}" voltou para os ativos.`,
            );
        },
        onError: (error: Error) => toast.error(error.message),
    });

    function resetToFirstPage<T>(apply: (value: T) => void) {
        return (value: T) => {
            apply(value);
            setPage(1);
        };
    }

    const isFirstLoad = leads.isPending;
    const isFetching = leads.isFetching;

    return (
        <div className="flex min-h-0 flex-col">
            <PageHeader title="Lista de Leads">
                <div className="flex flex-1 items-center justify-end gap-3">
                    <div className="relative w-full max-w-sm">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) =>
                                resetToFirstPage(setSearch)(event.currentTarget.value)
                            }
                            placeholder="Buscar..."
                            aria-label="Buscar leads por nome, empresa ou e-mail"
                            className="h-10 pl-9"
                        />
                    </div>

                    <Button asChild size="lg" className="h-10">
                        <Link to={ROUTES.newLead}>
                            <Plus />
                            Novo Lead
                        </Link>
                    </Button>
                </div>
            </PageHeader>

            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-8 py-4">
                <div className="flex flex-wrap items-center gap-3">
                    <AsyncCombobox
                        value={sellerId}
                        onValueChange={resetToFirstPage(setSellerId)}
                        queryKey={['users', 'combobox', 'filter']}
                        fetchPage={(search, page) =>
                            listUsers({ search, page, pageSize: COMBOBOX_PAGE_SIZE })
                        }
                        getOptionValue={(seller) => seller.id}
                        getOptionLabel={(seller) => seller.name}
                        placeholder="Vendedor: Todos"
                        searchPlaceholder="Buscar vendedor..."
                        emptyMessage="Nenhum vendedor encontrado."
                        allOption={{ value: ALL_SELLERS, label: 'Vendedor: Todos' }}
                        className="h-9 w-56"
                    />

                    <Select
                        value={view}
                        onValueChange={resetToFirstPage((value: string) =>
                            setView(LeadViewSchema.parse(value)),
                        )}
                    >
                        <SelectTrigger className="h-9 w-44" aria-label="Filtrar por situação">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {LEAD_VIEWS.map((option) => (
                                <SelectItem key={option} value={option}>
                                    {LEAD_VIEW_LABELS[option]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <p
                    aria-live="polite"
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                    {isFetching
                        ? 'Carregando…'
                        : leads.data
                          ? `${leads.data.total} Leads encontrados`
                          : null}
                </p>
            </div>

            <div className="p-8">
                <div
                    aria-busy={isFetching}
                    className={cn(
                        'relative overflow-hidden rounded-xl border border-border',
                        isFirstLoad && 'min-h-72',
                    )}
                >
                    {isFetching && (
                        <div
                            role="status"
                            className="absolute inset-0 z-10 flex items-center justify-center bg-background/50"
                        >
                            <Loader2 className="size-9 animate-spin text-primary" aria-hidden />
                            <span className="sr-only">Carregando leads…</span>
                        </div>
                    )}

                    <div
                        className={cn(
                            'overflow-x-auto transition-opacity duration-150',
                            isFetching ? 'pointer-events-none opacity-40' : 'opacity-100',
                        )}
                    >
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-secondary/60 hover:bg-secondary/60">
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Empresa</TableHead>
                                    <TableHead>E-mail</TableHead>
                                    <TableHead>Telefone</TableHead>
                                    <TableHead>Vendedor</TableHead>
                                    <TableHead>Última Interação</TableHead>
                                    <TableHead className="w-px text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {leads.isError && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="py-10 text-center text-destructive"
                                        >
                                            Não foi possível carregar os leads:{' '}
                                            {leads.error.message}
                                        </TableCell>
                                    </TableRow>
                                )}

                                {leads.data?.items.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="py-10 text-center text-muted-foreground"
                                        >
                                            Nenhum lead encontrado.
                                        </TableCell>
                                    </TableRow>
                                )}

                                {leads.data?.items.map((lead) => (
                                    <LeadRow
                                        key={lead.id}
                                        lead={lead}
                                        canManage={canManage(lead.seller.id)}
                                        isBusy={archiving.isPending}
                                        onToggleArchive={() =>
                                            archiving.mutate({
                                                id: lead.id,
                                                archived: lead.archivedAt !== null,
                                            })
                                        }
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {leads.data && leads.data.pageCount > 1 && (
                    <nav
                        aria-label="Paginação"
                        className="mt-6 flex items-center justify-between gap-4"
                    >
                        <p className="text-sm text-muted-foreground">
                            Página {leads.data.page} de {leads.data.pageCount}
                        </p>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="lg"
                                className="h-9"
                                disabled={page <= 1 || isFetching}
                                onClick={() => setPage((current) => current - 1)}
                            >
                                <ChevronLeft />
                                Anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="h-9"
                                disabled={page >= leads.data.pageCount || isFetching}
                                onClick={() => setPage((current) => current + 1)}
                            >
                                Próxima
                                <ChevronRight />
                            </Button>
                        </div>
                    </nav>
                )}
            </div>
        </div>
    );
}

interface LeadRowProps {
    lead: Lead;
    canManage: boolean;
    isBusy: boolean;
    onToggleArchive: () => void;
}

function LeadRow({ lead, canManage, isBusy, onToggleArchive }: LeadRowProps) {
    const isArchived = lead.archivedAt !== null;

    return (
        <TableRow className={cn(isArchived && 'opacity-60')}>
            <TableCell className="font-medium">
                <Link
                    to={editLeadPath(lead.id)}
                    className="rounded-sm underline-offset-4 hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                    {lead.name}
                </Link>
                {isArchived && (
                    <span className="ml-2 rounded border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground">
                        Arquivado
                    </span>
                )}
            </TableCell>
            <TableCell className="text-muted-foreground">{lead.companyName}</TableCell>
            <TableCell className="text-muted-foreground">{lead.email}</TableCell>
            <TableCell className="text-muted-foreground">{lead.phone}</TableCell>
            <TableCell>{lead.seller.name}</TableCell>
            <TableCell className="text-muted-foreground">
                {lead.lastInteraction ? formatDateTime(lead.lastInteraction) : '—'}
            </TableCell>
            <TableCell className="text-right">
                {!canManage ? null : isArchived ? (
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        disabled={isBusy}
                        onClick={onToggleArchive}
                        aria-label={`Desarquivar ${lead.name}`}
                        title="Desarquivar"
                    >
                        <ArchiveRestore />
                    </Button>
                ) : (
                    <ConfirmDialog
                        title="Arquivar este lead?"
                        description={
                            <>
                                <strong className="text-foreground">{lead.name}</strong> sai da
                                lista de ativos, mas nada é excluído — negócios e comentários
                                continuam intactos, e você pode desarquivar quando quiser.
                            </>
                        }
                        confirmLabel="Arquivar"
                        isPending={isBusy}
                        onConfirm={onToggleArchive}
                        trigger={
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                disabled={isBusy}
                                aria-label={`Arquivar ${lead.name}`}
                                title="Arquivar"
                            >
                                <Archive />
                            </Button>
                        }
                    />
                )}
            </TableCell>
        </TableRow>
    );
}

function formatDateTime(value: Date): string {
    return value.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

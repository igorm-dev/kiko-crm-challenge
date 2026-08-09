import { useState } from 'react';
import { Link } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Loader2, Plus, Search } from 'lucide-react';
import {
    DEAL_STATUS_LABELS,
    DEFAULT_PAGE_SIZE,
    DealStatus,
    DealStatusSchema,
    type Deal,
} from '@kiko/contracts';
import { AsyncCombobox, COMBOBOX_PAGE_SIZE } from '@/components/AsyncCombobox';
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
import { cn } from '@/lib/utils';
import { formatCurrency, formatRelativeDateTime } from '@/lib/format';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { listDeals } from '@/services/deals.service';
import { listUsers } from '@/services/users.service';
import { dealDetailPath, ROUTES } from '@/routes/paths';

const ALL = 'all';

export function DealsListPage() {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState(ALL);
    const [sellerId, setSellerId] = useState(ALL);
    const [page, setPage] = useState(1);

    const debouncedSearch = useDebouncedValue(search, 350);

    const deals = useQuery({
        queryKey: ['deals', 'list', { page, search: debouncedSearch, status, sellerId }],
        queryFn: () =>
            listDeals({
                page,
                pageSize: DEFAULT_PAGE_SIZE,
                search: debouncedSearch || undefined,
                status: status === ALL ? undefined : DealStatusSchema.parse(status),
                sellerId: sellerId === ALL ? undefined : sellerId,
            }),
        placeholderData: keepPreviousData,
        staleTime: 0,
    });

    function resetToFirstPage<T>(apply: (value: T) => void) {
        return (value: T) => {
            apply(value);
            setPage(1);
        };
    }

    const isFirstLoad = deals.isPending;
    const isFetching = deals.isFetching;

    return (
        <div className="flex min-h-0 flex-col">
            <PageHeader title="Negócios">
                <div className="flex flex-1 items-center justify-end gap-3">
                    <div className="relative w-full max-w-sm">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) =>
                                resetToFirstPage(setSearch)(event.currentTarget.value)
                            }
                            placeholder="Buscar..."
                            aria-label="Buscar negócios por nome, código ou lead"
                            className="h-10 pl-9"
                        />
                    </div>

                    <Button asChild size="lg" className="h-10">
                        <Link to={ROUTES.newDeal}>
                            <Plus />
                            Novo Negócio
                        </Link>
                    </Button>
                </div>
            </PageHeader>

            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-8 py-4">
                <div className="flex flex-wrap items-center gap-3">
                    <Select value={status} onValueChange={resetToFirstPage(setStatus)}>
                        <SelectTrigger className="h-9 w-52" aria-label="Filtrar por situação">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>Situação: Todas</SelectItem>
                            {Object.values(DealStatus).map((option) => (
                                <SelectItem key={option} value={option}>
                                    {DEAL_STATUS_LABELS[option]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <AsyncCombobox
                        value={sellerId}
                        onValueChange={resetToFirstPage(setSellerId)}
                        queryKey={['users', 'combobox', 'deal-filter']}
                        fetchPage={(search, page) =>
                            listUsers({ search, page, pageSize: COMBOBOX_PAGE_SIZE })
                        }
                        getOptionValue={(seller) => seller.id}
                        getOptionLabel={(seller) => seller.name}
                        placeholder="Vendedor: Todos"
                        searchPlaceholder="Buscar vendedor..."
                        emptyMessage="Nenhum vendedor encontrado."
                        allOption={{ value: ALL, label: 'Vendedor: Todos' }}
                        className="h-9 w-56"
                    />
                </div>

                <p
                    aria-live="polite"
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                    {isFetching
                        ? 'Carregando…'
                        : deals.data
                          ? `${deals.data.total} negócios encontrados`
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
                            <span className="sr-only">Carregando negócios…</span>
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
                                    <TableHead>Código</TableHead>
                                    <TableHead>Negócio</TableHead>
                                    <TableHead>Lead</TableHead>
                                    <TableHead>Vendedor</TableHead>
                                    <TableHead className="text-right">Valor</TableHead>
                                    <TableHead>Situação</TableHead>
                                    <TableHead>Última Interação</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {deals.isError && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="py-10 text-center text-destructive"
                                        >
                                            Não foi possível carregar os negócios:{' '}
                                            {deals.error.message}
                                        </TableCell>
                                    </TableRow>
                                )}

                                {deals.data?.items.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="py-10 text-center text-muted-foreground"
                                        >
                                            Nenhum negócio encontrado.
                                        </TableCell>
                                    </TableRow>
                                )}

                                {deals.data?.items.map((deal) => (
                                    <DealRow key={deal.id} deal={deal} />
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {deals.data && deals.data.pageCount > 1 && (
                    <nav
                        aria-label="Paginação"
                        className="mt-6 flex items-center justify-between gap-4"
                    >
                        <p className="text-sm text-muted-foreground">
                            Página {deals.data.page} de {deals.data.pageCount}
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
                                disabled={page >= deals.data.pageCount || isFetching}
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

function DealRow({ deal }: { deal: Deal }) {
    return (
        <TableRow>
            <TableCell className="font-mono text-xs text-muted-foreground">{deal.code}</TableCell>
            <TableCell className="font-medium">
                <Link
                    to={dealDetailPath(deal.id)}
                    className="rounded-sm underline-offset-4 hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                    {deal.name}
                </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">{deal.lead.name}</TableCell>
            <TableCell>{deal.seller.name}</TableCell>
            <TableCell className="text-right font-semibold text-primary">
                {formatCurrency(deal.estimatedValue)}
            </TableCell>
            <TableCell>
                <span className="rounded border border-border px-1.5 py-0.5 text-[11px]">
                    {DEAL_STATUS_LABELS[deal.status]}
                </span>
            </TableCell>
            <TableCell className="text-muted-foreground">
                {deal.lastContactAt ? formatRelativeDateTime(deal.lastContactAt) : '—'}
            </TableCell>
        </TableRow>
    );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    ChevronLeft,
    ChevronRight,
    KeyRound,
    Loader2,
    Plus,
    Search,
    UserCheck,
    UserX,
} from 'lucide-react';
import {
    DEFAULT_PAGE_SIZE,
    USER_VIEW_LABELS,
    USER_VIEWS,
    UserRole,
    UserViewSchema,
    type GeneratedPassword,
    type User,
    type UserView,
} from '@kiko/contracts';
import { toast } from 'sonner';
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
import { cn } from '@/lib/utils';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { disableUser, enableUser, listUsers, resetUserPassword } from '@/services/users.service';
import { editSellerPath, ROUTES } from '@/routes/paths';
import { GeneratedPasswordDialog } from './GeneratedPasswordDialog';

export function SellersPage() {
    const [search, setSearch] = useState('');
    const [view, setView] = useState<UserView>('active');
    const [page, setPage] = useState(1);
    const [passwordResult, setPasswordResult] = useState<GeneratedPassword | null>(null);

    const debouncedSearch = useDebouncedValue(search, 350);
    const queryClient = useQueryClient();
    const isAdmin = useIsAdmin();

    const sellers = useQuery({
        queryKey: ['users', { page, search: debouncedSearch, view }],
        queryFn: () =>
            listUsers({
                page,
                pageSize: DEFAULT_PAGE_SIZE,
                search: debouncedSearch || undefined,
                role: UserRole.Seller,
                view,
            }),
        placeholderData: keepPreviousData,
        staleTime: 0,
    });

    function invalidate() {
        return queryClient.invalidateQueries({ queryKey: ['users'] });
    }

    const availability = useMutation({
        mutationFn: ({ id, disabled }: { id: string; disabled: boolean }) =>
            disabled ? enableUser(id) : disableUser(id),
        onSuccess: async (user) => {
            await invalidate();
            toast.success(
                user.disabledAt
                    ? `${user.name} foi desabilitado e não consegue mais entrar.`
                    : `${user.name} voltou a ter acesso.`,
            );
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const resetting = useMutation({
        mutationFn: resetUserPassword,
        onSuccess: async (result) => {
            await invalidate();
            setPasswordResult(result);
        },
        onError: (error: Error) => toast.error(error.message),
    });

    function resetToFirstPage<T>(apply: (value: T) => void) {
        return (value: T) => {
            apply(value);
            setPage(1);
        };
    }

    const isFirstLoad = sellers.isPending;
    const isFetching = sellers.isFetching;
    const isBusy = availability.isPending || resetting.isPending;

    return (
        <div className="flex min-h-0 flex-col">
            <PageHeader title="Vendedores">
                <div className="flex flex-1 items-center justify-end gap-3">
                    <div className="relative w-full max-w-sm">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) =>
                                resetToFirstPage(setSearch)(event.currentTarget.value)
                            }
                            placeholder="Buscar..."
                            aria-label="Buscar vendedores por nome ou e-mail"
                            className="h-10 pl-9"
                        />
                    </div>

                    {isAdmin && (
                        <Button asChild size="lg" className="h-10">
                            <Link to={ROUTES.newSeller}>
                                <Plus />
                                Novo Vendedor
                            </Link>
                        </Button>
                    )}
                </div>
            </PageHeader>

            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-8 py-4">
                <Select
                    value={view}
                    onValueChange={resetToFirstPage((value: string) =>
                        setView(UserViewSchema.parse(value)),
                    )}
                >
                    <SelectTrigger className="h-9 w-48" aria-label="Filtrar por situação">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {USER_VIEWS.map((option) => (
                            <SelectItem key={option} value={option}>
                                {USER_VIEW_LABELS[option]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <p
                    aria-live="polite"
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                    {isFetching
                        ? 'Carregando…'
                        : sellers.data
                          ? `${sellers.data.total} vendedores encontrados`
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
                            <span className="sr-only">Carregando vendedores…</span>
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
                                    <TableHead>E-mail</TableHead>
                                    <TableHead>Cargo</TableHead>
                                    <TableHead>Situação</TableHead>
                                    {isAdmin && (
                                        <TableHead className="w-px text-right">Ações</TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {sellers.isError && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={isAdmin ? 5 : 4}
                                            className="py-10 text-center text-destructive"
                                        >
                                            Não foi possível carregar os vendedores:{' '}
                                            {sellers.error.message}
                                        </TableCell>
                                    </TableRow>
                                )}

                                {sellers.data?.items.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={isAdmin ? 5 : 4}
                                            className="py-10 text-center text-muted-foreground"
                                        >
                                            Nenhum vendedor encontrado.
                                        </TableCell>
                                    </TableRow>
                                )}

                                {sellers.data?.items.map((seller) => (
                                    <SellerRow
                                        key={seller.id}
                                        seller={seller}
                                        isAdmin={isAdmin}
                                        isBusy={isBusy}
                                        onToggleAvailability={() =>
                                            availability.mutate({
                                                id: seller.id,
                                                disabled: seller.disabledAt !== null,
                                            })
                                        }
                                        onResetPassword={() => resetting.mutate(seller.id)}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {sellers.data && sellers.data.pageCount > 1 && (
                    <nav
                        aria-label="Paginação"
                        className="mt-6 flex items-center justify-between gap-4"
                    >
                        <p className="text-sm text-muted-foreground">
                            Página {sellers.data.page} de {sellers.data.pageCount}
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
                                disabled={page >= sellers.data.pageCount || isFetching}
                                onClick={() => setPage((current) => current + 1)}
                            >
                                Próxima
                                <ChevronRight />
                            </Button>
                        </div>
                    </nav>
                )}
            </div>

            <GeneratedPasswordDialog
                result={passwordResult}
                onClose={() => setPasswordResult(null)}
            />
        </div>
    );
}

interface SellerRowProps {
    seller: User;
    isAdmin: boolean;
    isBusy: boolean;
    onToggleAvailability: () => void;
    onResetPassword: () => void;
}

function SellerRow({
    seller,
    isAdmin,
    isBusy,
    onToggleAvailability,
    onResetPassword,
}: SellerRowProps) {
    const isDisabled = seller.disabledAt !== null;

    return (
        <TableRow className={cn(isDisabled && 'opacity-60')}>
            <TableCell className="font-medium">
                {isAdmin ? (
                    <Link
                        to={editSellerPath(seller.id)}
                        className="rounded-sm underline-offset-4 hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                        {seller.name}
                    </Link>
                ) : (
                    seller.name
                )}
            </TableCell>
            <TableCell className="text-muted-foreground">{seller.email}</TableCell>
            <TableCell className="text-muted-foreground">{seller.jobTitle}</TableCell>
            <TableCell>
                <span
                    className={cn(
                        'rounded border px-1.5 py-0.5 text-[11px]',
                        isDisabled
                            ? 'border-border text-muted-foreground'
                            : 'border-primary/40 text-primary',
                    )}
                >
                    {isDisabled ? 'Desabilitado' : 'Ativo'}
                </span>
            </TableCell>
            {isAdmin && (
                <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                        <ConfirmDialog
                            title={`Redefinir a senha de ${seller.name}?`}
                            description="A senha atual deixa de funcionar imediatamente e uma nova é gerada. Você vai vê-la uma única vez para repassar."
                            confirmLabel="Redefinir senha"
                            isPending={isBusy}
                            onConfirm={onResetPassword}
                            trigger={
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    disabled={isBusy}
                                    aria-label={`Redefinir senha de ${seller.name}`}
                                    title="Redefinir senha"
                                >
                                    <KeyRound />
                                </Button>
                            }
                        />

                        {isDisabled ? (
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                disabled={isBusy}
                                onClick={onToggleAvailability}
                                aria-label={`Habilitar ${seller.name}`}
                                title="Habilitar"
                            >
                                <UserCheck />
                            </Button>
                        ) : (
                            <ConfirmDialog
                                title={`Desabilitar ${seller.name}?`}
                                description="Ele perde o acesso ao CRM no próximo login, mas continua responsável pelos leads que já tem. Você pode reabilitar quando quiser."
                                confirmLabel="Desabilitar"
                                isPending={isBusy}
                                onConfirm={onToggleAvailability}
                                trigger={
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        disabled={isBusy}
                                        aria-label={`Desabilitar ${seller.name}`}
                                        title="Desabilitar"
                                    >
                                        <UserX />
                                    </Button>
                                }
                            />
                        )}
                    </div>
                </TableCell>
            )}
        </TableRow>
    );
}

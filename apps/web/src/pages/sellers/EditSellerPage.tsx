import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { KeyRound, Loader2, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import type { GeneratedPassword, User } from '@kiko/contracts';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PageHeader } from '@/components/layouts/PageHeader';
import { Button } from '@/components/ui/button';
import { enableUser, getUser, resetUserPassword, updateUser } from '@/services/users.service';
import { ROUTES } from '@/routes/paths';
import { GeneratedPasswordDialog } from './GeneratedPasswordDialog';
import { SellerForm, type SellerFormValues } from './SellerForm';

export function EditSellerPage() {
    const { id = '' } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [formError, setFormError] = useState<string | null>(null);
    const [result, setResult] = useState<GeneratedPassword | null>(null);

    const seller = useQuery({
        queryKey: ['user', id],
        queryFn: () => getUser(id),
        enabled: id !== '',
    });

    function invalidate() {
        return Promise.all([
            queryClient.invalidateQueries({ queryKey: ['users'] }),
            queryClient.invalidateQueries({ queryKey: ['user', id] }),
        ]);
    }

    const mutation = useMutation({
        mutationFn: (input: Parameters<typeof updateUser>[1]) => updateUser(id, input),
        onSuccess: async () => {
            await invalidate();
            navigate(ROUTES.sellers);
        },
        onError: (error: Error) => setFormError(error.message),
    });

    const resetting = useMutation({
        mutationFn: () => resetUserPassword(id),
        onSuccess: async (generated) => {
            await invalidate();
            setResult(generated);
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const enabling = useMutation({
        mutationFn: () => enableUser(id),
        onSuccess: async (user) => {
            await invalidate();
            toast.success(`${user.name} voltou a ter acesso.`);
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const isDisabled = seller.data?.disabledAt != null;
    const isBusy = resetting.isPending || enabling.isPending;

    return (
        <div>
            <PageHeader title="Editar Vendedor">
                {seller.data && (
                    <ConfirmDialog
                        title={`Redefinir a senha de ${seller.data.name}?`}
                        description="A senha atual deixa de funcionar imediatamente e uma nova é gerada. Você vai vê-la uma única vez para repassar."
                        confirmLabel="Redefinir senha"
                        isPending={isBusy}
                        onConfirm={() => resetting.mutate()}
                        trigger={
                            <Button variant="outline" size="lg" className="h-10" disabled={isBusy}>
                                {resetting.isPending ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    <KeyRound />
                                )}
                                Redefinir senha
                            </Button>
                        }
                    />
                )}
            </PageHeader>

            <div className="p-8">
                {seller.isPending && (
                    <div role="status" className="flex max-w-3xl items-center justify-center py-24">
                        <Loader2 className="size-9 animate-spin text-primary" aria-hidden />
                        <span className="sr-only">Carregando vendedor…</span>
                    </div>
                )}

                {seller.isError && (
                    <p
                        role="alert"
                        className="max-w-3xl rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                    >
                        Não foi possível carregar o vendedor: {seller.error.message}
                    </p>
                )}

                {isDisabled && (
                    <div
                        role="status"
                        className="mb-5 flex max-w-3xl flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-secondary/50 px-4 py-3"
                    >
                        <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">
                                Este vendedor está desabilitado.
                            </span>{' '}
                            Ele não consegue entrar no CRM, mas segue responsável pelos leads que já
                            tem.
                        </p>

                        <Button
                            variant="outline"
                            size="sm"
                            disabled={isBusy}
                            onClick={() => enabling.mutate()}
                        >
                            {enabling.isPending ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <UserCheck />
                            )}
                            Habilitar
                        </Button>
                    </div>
                )}

                {seller.data && (
                    <SellerForm
                        initialValues={toFormValues(seller.data)}
                        submitLabel="Salvar alterações"
                        isSubmitting={mutation.isPending}
                        formError={formError}
                        onSubmit={(input) => {
                            setFormError(null);
                            mutation.mutate(input);
                        }}
                    />
                )}
            </div>

            <GeneratedPasswordDialog result={result} onClose={() => setResult(null)} />
        </div>
    );
}

function toFormValues(seller: User): SellerFormValues {
    return {
        name: seller.name,
        email: seller.email,
        jobTitle: seller.jobTitle,
    };
}

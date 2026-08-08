import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Archive, ArchiveRestore, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Lead } from '@kiko/contracts';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PageHeader } from '@/components/layouts/PageHeader';
import { Button } from '@/components/ui/button';
import { archiveLead, getLead, unarchiveLead, updateLead } from '@/services/leads.service';
import { ROUTES } from '@/routes/paths';
import { LeadForm, type LeadFormValues } from './LeadForm';

export function EditLeadPage() {
    const { id = '' } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [formError, setFormError] = useState<string | null>(null);

    const lead = useQuery({
        queryKey: ['lead', id],
        queryFn: () => getLead(id),
        enabled: id !== '',
    });

    const mutation = useMutation({
        mutationFn: (input: Parameters<typeof updateLead>[1]) => updateLead(id, input),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['leads'] });
            await queryClient.invalidateQueries({ queryKey: ['lead', id] });
            navigate(ROUTES.leads);
        },
        onError: (error: Error) => setFormError(error.message),
    });

    const archiving = useMutation({
        mutationFn: (archived: boolean) => (archived ? unarchiveLead(id) : archiveLead(id)),
        onSuccess: async (updated) => {
            await queryClient.invalidateQueries({ queryKey: ['leads'] });
            await queryClient.invalidateQueries({ queryKey: ['lead', id] });
            toast.success(
                updated.archivedAt
                    ? `"${updated.name}" foi arquivado.`
                    : `"${updated.name}" voltou para os ativos.`,
            );
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const isArchived = lead.data?.archivedAt != null;

    return (
        <div>
            <PageHeader title="Editar Lead">
                {lead.data && !isArchived && (
                    <ConfirmDialog
                        title="Arquivar este lead?"
                        description={
                            <>
                                <strong className="text-foreground">{lead.data.name}</strong> sai da
                                lista de ativos, mas nada é excluído — negócios e comentários
                                continuam intactos, e você pode desarquivar quando quiser.
                            </>
                        }
                        confirmLabel="Arquivar"
                        isPending={archiving.isPending}
                        onConfirm={() => archiving.mutate(false)}
                        trigger={
                            <Button
                                variant="outline"
                                size="lg"
                                className="h-10"
                                disabled={archiving.isPending}
                            >
                                {archiving.isPending ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    <Archive />
                                )}
                                Arquivar
                            </Button>
                        }
                    />
                )}
            </PageHeader>

            <div className="p-8">
                {lead.isPending && (
                    <div role="status" className="flex max-w-3xl items-center justify-center py-24">
                        <Loader2 className="size-9 animate-spin text-primary" aria-hidden />
                        <span className="sr-only">Carregando lead…</span>
                    </div>
                )}

                {lead.isError && (
                    <p
                        role="alert"
                        className="max-w-3xl rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                    >
                        Não foi possível carregar o lead: {lead.error.message}
                    </p>
                )}

                {isArchived && (
                    <div
                        role="status"
                        className="mb-5 flex max-w-3xl flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-secondary/50 px-4 py-3"
                    >
                        <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">
                                Este lead está arquivado.
                            </span>{' '}
                            Ele não aparece na lista de ativos, mas continua editável.
                        </p>

                        <Button
                            variant="outline"
                            size="sm"
                            disabled={archiving.isPending}
                            onClick={() => archiving.mutate(true)}
                        >
                            {archiving.isPending ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <ArchiveRestore />
                            )}
                            Desarquivar
                        </Button>
                    </div>
                )}

                {lead.data && (
                    <LeadForm
                        initialValues={toFormValues(lead.data)}
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
        </div>
    );
}

function toFormValues(lead: Lead): LeadFormValues {
    return {
        name: lead.name,
        companyName: lead.companyName,
        email: lead.email,
        phone: lead.phone,
        roleTitle: lead.roleTitle ?? '',
        source: lead.source,
        sellerId: lead.seller.id,
        observation: lead.observation ?? '',
    };
}

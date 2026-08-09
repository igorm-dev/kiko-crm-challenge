import { useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { CreateDealSchema } from '@kiko/contracts';
import { AsyncCombobox, COMBOBOX_PAGE_SIZE } from '@/components/AsyncCombobox';
import { PageHeader } from '@/components/layouts/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { TextField } from '@/components/ui/text-field';
import { Textarea } from '@/components/ui/textarea';
import { createDeal } from '@/services/deals.service';
import { listLeads } from '@/services/leads.service';
import { listUsers } from '@/services/users.service';
import { usePermissions } from '@/hooks/usePermissions';
import { ROUTES } from '@/routes/paths';

type FieldName = 'name' | 'leadId' | 'sellerId' | 'estimatedValue' | 'expectedCloseDate';
type FieldErrors = Partial<Record<FieldName, string>>;

const EMPTY_FORM = {
    name: '',
    leadId: '',
    sellerId: '',
    estimatedValue: '',
    expectedCloseDate: '',
    description: '',
};

export function NewDealPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { isAdmin, actor } = usePermissions();

    const [form, setForm] = useState(EMPTY_FORM);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [formError, setFormError] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: createDeal,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['deals'] });
            navigate(ROUTES.board);
        },
        onError: (error: Error) => setFormError(error.message),
    });

    const effectiveSellerId = isAdmin ? form.sellerId : (actor?.id ?? form.sellerId);

    function update(field: keyof typeof EMPTY_FORM) {
        return (value: string) => setForm((current) => ({ ...current, [field]: value }));
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormError(null);

        const parsed = CreateDealSchema.safeParse({ ...form, sellerId: effectiveSellerId });

        if (!parsed.success) {
            const flattened = parsed.error.flatten().fieldErrors;
            setFieldErrors(
                Object.fromEntries(
                    Object.entries(flattened).map(([field, messages]) => [field, messages?.[0]]),
                ),
            );
            return;
        }

        setFieldErrors({});
        mutation.mutate(parsed.data);
    }

    const isSubmitting = mutation.isPending;

    return (
        <div>
            <PageHeader title="Novo Negócio" />

            <div className="p-8">
                <Card className="max-w-3xl">
                    <CardHeader>
                        <CardTitle>Dados da Negociação</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} noValidate className="grid gap-5">
                            {formError && (
                                <p
                                    role="alert"
                                    className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                                >
                                    {formError}
                                </p>
                            )}

                            <TextField
                                label="Nome do Negócio"
                                required
                                placeholder="Ex: Academia X - Kit Completo"
                                value={form.name}
                                onChange={(event) => update('name')(event.currentTarget.value)}
                                error={fieldErrors.name}
                                disabled={isSubmitting}
                            />

                            <div className="grid gap-5 sm:grid-cols-2">
                                <ComboField
                                    label="Lead"
                                    error={fieldErrors.leadId}
                                    combobox={
                                        <AsyncCombobox
                                            value={form.leadId}
                                            onValueChange={update('leadId')}
                                            queryKey={['leads', 'combobox']}
                                            fetchPage={(search, page) =>
                                                listLeads({
                                                    search,
                                                    page,
                                                    pageSize: COMBOBOX_PAGE_SIZE,
                                                })
                                            }
                                            getOptionValue={(lead) => lead.id}
                                            getOptionLabel={(lead) =>
                                                `${lead.name} — ${lead.companyName}`
                                            }
                                            placeholder="Selecione o lead"
                                            searchPlaceholder="Buscar lead..."
                                            emptyMessage="Nenhum lead encontrado."
                                            invalid={fieldErrors.leadId !== undefined}
                                            disabled={isSubmitting}
                                        />
                                    }
                                />

                                <ComboField
                                    label="Vendedor Responsável"
                                    error={fieldErrors.sellerId}
                                    combobox={
                                        <AsyncCombobox
                                            value={effectiveSellerId}
                                            onValueChange={update('sellerId')}
                                            queryKey={['users', 'combobox', 'deal']}
                                            fetchPage={(search, page) =>
                                                listUsers({
                                                    search,
                                                    page,
                                                    pageSize: COMBOBOX_PAGE_SIZE,
                                                })
                                            }
                                            getOptionValue={(seller) => seller.id}
                                            getOptionLabel={(seller) => seller.name}
                                            placeholder="Atribuir a um vendedor"
                                            searchPlaceholder="Buscar vendedor..."
                                            emptyMessage="Nenhum vendedor encontrado."
                                            invalid={fieldErrors.sellerId !== undefined}
                                            disabled={isSubmitting || !isAdmin}
                                        />
                                    }
                                />

                                <TextField
                                    label="Valor Estimado (R$)"
                                    required
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="89000"
                                    value={form.estimatedValue}
                                    onChange={(event) =>
                                        update('estimatedValue')(event.currentTarget.value)
                                    }
                                    error={fieldErrors.estimatedValue}
                                    disabled={isSubmitting}
                                />

                                <TextField
                                    label="Previsão de Fechamento"
                                    type="date"
                                    value={form.expectedCloseDate}
                                    onChange={(event) =>
                                        update('expectedCloseDate')(event.currentTarget.value)
                                    }
                                    error={fieldErrors.expectedCloseDate}
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Descrição</Label>
                                <Textarea
                                    id="description"
                                    rows={4}
                                    placeholder="Ex: 12 esteiras profissionais e 4 estações de musculação."
                                    value={form.description}
                                    onChange={(event) =>
                                        update('description')(event.currentTarget.value)
                                    }
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="lg"
                                    className="h-10"
                                    disabled={isSubmitting}
                                    onClick={() => navigate(ROUTES.board)}
                                >
                                    Cancelar
                                </Button>

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="h-10"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting && <Loader2 className="animate-spin" />}
                                    Salvar Negócio
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

interface ComboFieldProps {
    label: string;
    error?: string;
    combobox: ReactNode;
}

function ComboField({ label, error, combobox }: ComboFieldProps) {
    return (
        <div className="grid gap-2">
            <Label>
                {label}
                <span className="text-primary" aria-hidden="true">
                    *
                </span>
            </Label>

            {combobox}

            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}

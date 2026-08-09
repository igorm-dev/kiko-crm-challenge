import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import {
    CreateLeadSchema,
    LEAD_SOURCE_LABELS,
    LeadSource,
    type CreateLeadInput,
} from '@kiko/contracts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { TextField } from '@/components/ui/text-field';
import { Textarea } from '@/components/ui/textarea';
import { listUsers } from '@/services/users.service';
import { ROUTES } from '@/routes/paths';

export interface LeadFormValues {
    name: string;
    companyName: string;
    email: string;
    phone: string;
    roleTitle: string;
    source: string;
    sellerId: string;
    observation: string;
}

export const EMPTY_LEAD_FORM: LeadFormValues = {
    name: '',
    companyName: '',
    email: '',
    phone: '',
    roleTitle: '',
    source: '',
    sellerId: '',
    observation: '',
};

type FieldErrors = Partial<Record<keyof LeadFormValues, string>>;

interface LeadFormProps {
    initialValues: LeadFormValues;
    submitLabel: string;
    isSubmitting: boolean;
    formError: string | null;
    onSubmit: (input: CreateLeadInput) => void;
}

export function LeadForm({
    initialValues,
    submitLabel,
    isSubmitting,
    formError,
    onSubmit,
}: LeadFormProps) {
    const navigate = useNavigate();

    const [form, setForm] = useState(initialValues);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    const sellers = useQuery({
        queryKey: ['users', 'picker'],
        queryFn: () => listUsers({ pageSize: 100 }),
    });

    function update(field: keyof LeadFormValues) {
        return (value: string) => setForm((current) => ({ ...current, [field]: value }));
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const parsed = CreateLeadSchema.safeParse(form);

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
        onSubmit(parsed.data);
    }

    return (
        <Card className="max-w-3xl">
            <CardHeader>
                <CardTitle>Informações Gerais do Contato</CardTitle>
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

                    <div className="grid gap-5 sm:grid-cols-2">
                        <TextField
                            label="Nome Completo"
                            required
                            placeholder="Ex: Roberto Carlos da Silva"
                            value={form.name}
                            onChange={(event) => update('name')(event.currentTarget.value)}
                            error={fieldErrors.name}
                            disabled={isSubmitting}
                        />

                        <TextField
                            label="Nome da Empresa / Condomínio"
                            required
                            placeholder="Ex: Academia FitLife Centro"
                            value={form.companyName}
                            onChange={(event) => update('companyName')(event.currentTarget.value)}
                            error={fieldErrors.companyName}
                            disabled={isSubmitting}
                        />

                        <TextField
                            label="E-mail"
                            type="email"
                            required
                            placeholder="contato@empresa.com.br"
                            value={form.email}
                            onChange={(event) => update('email')(event.currentTarget.value)}
                            error={fieldErrors.email}
                            disabled={isSubmitting}
                        />

                        <TextField
                            label="Telefone"
                            required
                            placeholder="(11) 99999-8888"
                            value={form.phone}
                            onChange={(event) => update('phone')(event.currentTarget.value)}
                            error={fieldErrors.phone}
                            disabled={isSubmitting}
                        />

                        <TextField
                            label="Cargo"
                            placeholder="Ex: Gerente Geral / Síndico"
                            value={form.roleTitle}
                            onChange={(event) => update('roleTitle')(event.currentTarget.value)}
                            error={fieldErrors.roleTitle}
                            disabled={isSubmitting}
                        />

                        <SelectField
                            label="Origem do Lead"
                            required
                            placeholder="Selecione a Origem"
                            value={form.source}
                            onValueChange={update('source')}
                            error={fieldErrors.source}
                            disabled={isSubmitting}
                            options={Object.values(LeadSource).map((source) => ({
                                value: source,
                                label: LEAD_SOURCE_LABELS[source],
                            }))}
                        />
                    </div>

                    <SelectField
                        label="Vendedor Responsável"
                        required
                        placeholder="Atribuir a um vendedor"
                        value={form.sellerId}
                        onValueChange={update('sellerId')}
                        error={fieldErrors.sellerId}
                        disabled={isSubmitting || sellers.isPending}
                        options={(sellers.data?.items ?? []).map((seller) => ({
                            value: seller.id,
                            label: seller.name,
                        }))}
                    />

                    <div className="grid gap-2">
                        <Label htmlFor="observation">Observações e Histórico Preliminar</Label>
                        <Textarea
                            id="observation"
                            rows={5}
                            placeholder="Ex: Cliente demonstrou interesse inicial em esteiras profissionais…"
                            value={form.observation}
                            onChange={(event) => update('observation')(event.currentTarget.value)}
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
                            onClick={() => navigate(ROUTES.leads)}
                        >
                            Cancelar
                        </Button>

                        <Button type="submit" size="lg" className="h-10" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="animate-spin" />}
                            {submitLabel}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

interface SelectFieldProps {
    label: string;
    placeholder: string;
    value: string;
    onValueChange: (value: string) => void;
    options: { value: string; label: string }[];
    required?: boolean;
    error?: string;
    disabled?: boolean;
}

function SelectField({
    label,
    placeholder,
    value,
    onValueChange,
    options,
    required,
    error,
    disabled,
}: SelectFieldProps) {
    return (
        <div className="grid gap-2">
            <Label>
                {label}
                {required && (
                    <span className="text-primary" aria-hidden="true">
                        *
                    </span>
                )}
            </Label>

            <Select value={value} onValueChange={onValueChange} disabled={disabled}>
                <SelectTrigger className="h-11 w-full" aria-invalid={error ? true : undefined}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}

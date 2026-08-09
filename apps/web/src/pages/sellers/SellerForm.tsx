import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { CreateUserSchema, UserRole, type CreateUserInput } from '@kiko/contracts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TextField } from '@/components/ui/text-field';
import { ROUTES } from '@/routes/paths';

export interface SellerFormValues {
    name: string;
    email: string;
    jobTitle: string;
}

export const EMPTY_SELLER_FORM: SellerFormValues = {
    name: '',
    email: '',
    jobTitle: '',
};

type FieldErrors = Partial<Record<keyof SellerFormValues, string>>;

interface SellerFormProps {
    initialValues: SellerFormValues;
    submitLabel: string;
    isSubmitting: boolean;
    formError: string | null;
    onSubmit: (input: CreateUserInput) => void;
}

export function SellerForm({
    initialValues,
    submitLabel,
    isSubmitting,
    formError,
    onSubmit,
}: SellerFormProps) {
    const navigate = useNavigate();

    const [form, setForm] = useState(initialValues);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    function update(field: keyof SellerFormValues) {
        return (value: string) => setForm((current) => ({ ...current, [field]: value }));
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const parsed = CreateUserSchema.safeParse({ ...form, role: UserRole.Seller });

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
                <CardTitle>Dados do Vendedor</CardTitle>
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
                            placeholder="Ex: Marina Costa"
                            value={form.name}
                            onChange={(event) => update('name')(event.currentTarget.value)}
                            error={fieldErrors.name}
                            disabled={isSubmitting}
                        />

                        <TextField
                            label="E-mail profissional"
                            type="email"
                            required
                            placeholder="nome.sobrenome@kikos.com.br"
                            value={form.email}
                            onChange={(event) => update('email')(event.currentTarget.value)}
                            error={fieldErrors.email}
                            disabled={isSubmitting}
                        />
                    </div>

                    <TextField
                        label="Cargo"
                        required
                        placeholder="Ex: Executiva de Contas"
                        value={form.jobTitle}
                        onChange={(event) => update('jobTitle')(event.currentTarget.value)}
                        error={fieldErrors.jobTitle}
                        disabled={isSubmitting}
                    />

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            className="h-10"
                            disabled={isSubmitting}
                            onClick={() => navigate(ROUTES.sellers)}
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

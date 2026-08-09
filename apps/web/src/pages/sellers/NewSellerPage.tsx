import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { GeneratedPassword } from '@kiko/contracts';
import { PageHeader } from '@/components/layouts/PageHeader';
import { createUser } from '@/services/users.service';
import { ROUTES } from '@/routes/paths';
import { GeneratedPasswordDialog } from './GeneratedPasswordDialog';
import { EMPTY_SELLER_FORM, SellerForm } from './SellerForm';

export function NewSellerPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [formError, setFormError] = useState<string | null>(null);
    const [result, setResult] = useState<GeneratedPassword | null>(null);

    const mutation = useMutation({
        mutationFn: createUser,
        onSuccess: async (created) => {
            await queryClient.invalidateQueries({ queryKey: ['users'] });
            setResult(created);
        },
        onError: (error: Error) => setFormError(error.message),
    });

    return (
        <div>
            <PageHeader title="Novo Vendedor" />

            <div className="p-8">
                <SellerForm
                    initialValues={EMPTY_SELLER_FORM}
                    submitLabel="Salvar Vendedor"
                    isSubmitting={mutation.isPending}
                    formError={formError}
                    onSubmit={(input) => {
                        setFormError(null);
                        mutation.mutate(input);
                    }}
                />
            </div>

            <GeneratedPasswordDialog result={result} onClose={() => navigate(ROUTES.sellers)} />
        </div>
    );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/layouts/PageHeader';
import { createLead } from '@/services/leads.service';
import { ROUTES } from '@/routes/paths';
import { EMPTY_LEAD_FORM, LeadForm } from './LeadForm';

export function NewLeadPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [formError, setFormError] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: createLead,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['leads'] });
            navigate(ROUTES.leads);
        },
        onError: (error: Error) => setFormError(error.message),
    });

    return (
        <div>
            <PageHeader title="Criar Novo Lead" />

            <div className="p-8">
                <LeadForm
                    initialValues={EMPTY_LEAD_FORM}
                    submitLabel="Salvar Lead"
                    isSubmitting={mutation.isPending}
                    formError={formError}
                    onSubmit={(input) => {
                        setFormError(null);
                        mutation.mutate(input);
                    }}
                />
            </div>
        </div>
    );
}

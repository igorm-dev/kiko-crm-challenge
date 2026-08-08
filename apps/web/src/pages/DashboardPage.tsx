import { PageHeader } from '@/components/layouts/PageHeader';

export function DashboardPage() {
    return (
        <div>
            <PageHeader title="Dashboard" />

            <div className="p-8">
                <div className="rounded-xl border border-dashed border-border p-16 text-center text-sm text-muted-foreground">
                    Os indicadores do funil de vendas aparecerão aqui.
                </div>
            </div>
        </div>
    );
}

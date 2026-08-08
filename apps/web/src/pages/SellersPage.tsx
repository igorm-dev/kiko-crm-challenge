import { PageHeader } from '@/components/layouts/PageHeader';

export function SellersPage() {
    return (
        <div>
            <PageHeader title="Vendedores" />

            <div className="p-8">
                <div className="rounded-xl border border-dashed border-border p-16 text-center text-sm text-muted-foreground">
                    A gestão da equipe de vendas será construída aqui.
                </div>
            </div>
        </div>
    );
}

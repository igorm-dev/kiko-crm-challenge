import { useQuery } from '@tanstack/react-query';
import { HealthSchema } from '@kiko/contracts';
import { apiFetch } from '@/lib/api';

export function HomePage() {
    const { data, isPending, error } = useQuery({
        queryKey: ['health'],
        queryFn: () => apiFetch('/health', HealthSchema),
    });

    return (
        <section className="mx-auto max-w-2xl">
            <h1 className="text-2xl font-semibold tracking-tight">Kiko CRM</h1>
            <p className="mt-2 mb-8 text-sm text-neutral-500 dark:text-neutral-400">
                Projeto configurado. As entidades e telas serão adicionadas uma a uma.
            </p>

            <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <h2 className="mb-4 text-xs font-medium tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                    Status
                </h2>

                {isPending && (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Verificando…</p>
                )}

                {error && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                        API indisponível: {error.message}
                    </p>
                )}

                {data && (
                    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
                        <dt className="text-neutral-500 dark:text-neutral-400">API</dt>
                        <dd className="text-green-600 dark:text-green-400">online</dd>

                        <dt className="text-neutral-500 dark:text-neutral-400">Banco</dt>
                        <dd
                            className={
                                data.database === 'up'
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-red-600 dark:text-red-400'
                            }
                        >
                            {data.database === 'up' ? 'conectado' : 'sem conexão'}
                        </dd>

                        <dt className="text-neutral-500 dark:text-neutral-400">Verificado em</dt>
                        <dd>{data.timestamp.toLocaleTimeString('pt-BR')}</dd>
                    </dl>
                )}
            </div>
        </section>
    );
}

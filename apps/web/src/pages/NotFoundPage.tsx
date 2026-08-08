import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';

export function NotFoundPage() {
    return (
        <section className="mx-auto max-w-2xl">
            <h1 className="text-2xl font-semibold tracking-tight">Página não encontrada</h1>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                O endereço acessado não existe ou foi movido.
            </p>

            <Link
                to={ROUTES.home}
                className="mt-6 inline-block text-sm text-brand underline underline-offset-4"
            >
                Voltar para o início
            </Link>
        </section>
    );
}

import { Link } from 'react-router-dom';
import { KikosLogo } from '@/components/KikosLogo';
import { ROUTES } from '@/routes/paths';

/**
 * Placeholder. Recovery needs an e-mail-sending endpoint, so the screen exists
 * only to keep the "Esqueceu sua senha?" link from dead-ending.
 */
export function ForgotPasswordPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-surface-base px-4 py-12">
            <div className="w-full max-w-[440px] rounded-2xl border border-white/5 bg-surface-raised p-8 text-center sm:p-10">
                <KikosLogo className="text-3xl" />

                <h1 className="mt-6 text-lg font-semibold text-neutral-100">Recuperar senha</h1>
                <p className="mt-2 text-sm text-neutral-400">
                    A recuperação de senha ainda não está disponível. Fale com o administrador do
                    CRM para redefinir seu acesso.
                </p>

                <Link
                    to={ROUTES.login}
                    className="mt-6 inline-block text-sm text-brand underline underline-offset-4 hover:text-white"
                >
                    Voltar para o login
                </Link>
            </div>
        </main>
    );
}

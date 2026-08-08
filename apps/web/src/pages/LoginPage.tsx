import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { KikosLogo } from '@/components/KikosLogo';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { useAuth } from '@/hooks/useAuth';
import { LoginSchema } from '@/schemas/auth.schema';
import { ROUTES } from '@/routes/paths';

type FieldErrors = Partial<Record<'email' | 'password', string>>;

export function LoginPage() {
    const { isAuthenticated, signIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Where the user was headed before RequireAuth bounced them here.
    const from = (location.state as { from?: string } | null)?.from ?? ROUTES.home;

    if (isAuthenticated) {
        return <Navigate to={from} replace />;
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormError(null);

        const parsed = LoginSchema.safeParse({ email, password });
        if (!parsed.success) {
            const { fieldErrors: zodErrors } = parsed.error.flatten();
            setFieldErrors({
                email: zodErrors.email?.[0],
                password: zodErrors.password?.[0],
            });
            return;
        }

        setFieldErrors({});
        setIsSubmitting(true);

        try {
            await signIn(parsed.data.email, parsed.data.password);
            navigate(from, { replace: true });
        } catch (error) {
            setFormError(
                error instanceof Error
                    ? error.message
                    : 'Não foi possível entrar. Tente novamente.',
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-surface-base px-4 py-12">
            <div className="w-full max-w-[440px] rounded-2xl border border-white/5 bg-surface-raised p-8 shadow-2xl sm:p-10">
                <div className="text-center">
                    <KikosLogo className="text-4xl" />
                    <p className="mt-5 text-[15px] text-neutral-400">
                        Entre na sua conta corporativa para continuar
                    </p>
                </div>

                <form onSubmit={handleSubmit} noValidate className="mt-8">
                    {formError && (
                        <p
                            role="alert"
                            className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                        >
                            {formError}
                        </p>
                    )}

                    <TextField
                        label="E-mail profissional"
                        type="email"
                        name="email"
                        autoComplete="email"
                        placeholder="nome.sobrenome@kikos.com.br"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        error={fieldErrors.email}
                        disabled={isSubmitting}
                    />

                    <TextField
                        className="mt-5"
                        label="Senha"
                        type="password"
                        name="password"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        required
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        error={fieldErrors.password}
                        disabled={isSubmitting}
                    />

                    <div className="mt-3 text-right">
                        <Link
                            to={ROUTES.forgotPassword}
                            className="text-sm text-brand underline underline-offset-4 hover:text-white"
                        >
                            Esqueceu sua senha?
                        </Link>
                    </div>

                    <Button type="submit" loading={isSubmitting} className="mt-6 cursor-pointer">
                        {isSubmitting ? 'Entrando…' : 'Entrar no CRM'}
                    </Button>
                </form>

                <div className="my-7 flex items-center gap-4">
                    <span className="h-px flex-1 bg-white/10" />
                    <span className="text-xs text-neutral-500">ou acesse com</span>
                    <span className="h-px flex-1 bg-white/10" />
                </div>

                <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                        setFormError('O login via Google Workspace ainda não está disponível.')
                    }
                >
                    <GoogleMark />
                    Login via Google Workspace
                </Button>
            </div>
        </main>
    );
}

function GoogleMark() {
    return (
        <svg className="size-[18px]" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="10" cy="10" r="8.25" stroke="currentColor" strokeWidth="1.5" />
            <path
                d="M6.6 6.6l6.8 6.8M13.4 6.6l-6.8 6.8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
}

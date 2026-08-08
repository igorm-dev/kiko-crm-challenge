import { KikosLogo } from '@/components/KikosLogo';

export function FullPageLoader() {
    return (
        <div
            className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface-base"
            role="status"
            aria-live="polite"
        >
            <KikosLogo className="text-3xl" />
            <span className="size-6 animate-spin rounded-full border-2 border-surface-border border-t-brand" />
            <span className="sr-only">Carregando…</span>
        </div>
    );
}

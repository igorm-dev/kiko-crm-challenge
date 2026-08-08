import { Outlet } from 'react-router-dom';
import { KikosLogo } from '@/components/KikosLogo';
import { useAuth } from '@/hooks/useAuth';

/** Chrome shared by every authenticated screen. */
export function AppLayout() {
    const { user, signOut } = useAuth();

    return (
        <div className="min-h-screen">
            <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-3.5 dark:border-neutral-800 dark:bg-neutral-900">
                <KikosLogo className="text-lg text-neutral-900 dark:text-white" />

                <div className="flex items-center gap-4 text-sm">
                    <span className="text-neutral-500 dark:text-neutral-400">{user?.name}</span>
                    <button
                        type="button"
                        onClick={signOut}
                        className="text-neutral-500 underline underline-offset-4 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                    >
                        Sair
                    </button>
                </div>
            </header>

            <main className="px-6 py-8">
                <Outlet />
            </main>
        </div>
    );
}

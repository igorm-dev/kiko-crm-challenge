import { Route, Routes } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';

export function App() {
    return (
        <div className="min-h-screen">
            <header className="border-b border-neutral-200 bg-white px-6 py-3.5 dark:border-neutral-800 dark:bg-neutral-900">
                <span className="font-semibold tracking-tight">Kiko CRM</span>
            </header>

            <main className="px-6 py-8">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route
                        path="*"
                        element={
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Página não encontrada.
                            </p>
                        }
                    />
                </Routes>
            </main>
        </div>
    );
}

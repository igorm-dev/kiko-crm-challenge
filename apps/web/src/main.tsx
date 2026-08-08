import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { queryClient } from '@/lib/query-client';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { App } from './App';
import './styles.css';

const container = document.getElementById('root');
if (!container) {
    throw new Error('Root element #root not found in index.html');
}

createRoot(container).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AuthProvider>
                    <TooltipProvider>
                        <App />
                        <Toaster richColors position="bottom-right" />
                    </TooltipProvider>
                </AuthProvider>
            </BrowserRouter>
        </QueryClientProvider>
    </StrictMode>,
);

import { QueryClient } from '@tanstack/react-query';

/** Cache defaults for the whole app. One instance, created at boot. */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: { staleTime: 30_000, retry: 1 },
    },
});

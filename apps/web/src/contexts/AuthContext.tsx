import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { User } from '@kiko/contracts';
import { getToken } from '@/lib/auth-storage';
import { UNAUTHORIZED_EVENT } from '@/services/api';
import * as authService from '@/services/auth.service';

export const AUTH_QUERY_KEY = ['auth', 'me'] as const;

export interface AuthContextValue {
    user: User | null;
    isAuthenticated: boolean;

    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<User>;
    signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();

    const [token, setToken] = useState<string | null>(getToken);

    const { data: user, isPending } = useQuery({
        queryKey: AUTH_QUERY_KEY,
        queryFn: authService.getMe,
        enabled: token !== null,
        retry: false,
        staleTime: Infinity,
    });

    const signOut = useCallback(() => {
        authService.logout();
        setToken(null);

        queryClient.clear();
    }, [queryClient]);

    const signIn = useCallback(
        async (email: string, password: string) => {
            const signedIn = await authService.login(email, password);

            queryClient.setQueryData(AUTH_QUERY_KEY, signedIn);
            setToken(getToken());
            return signedIn;
        },
        [queryClient],
    );

    useEffect(() => {
        window.addEventListener(UNAUTHORIZED_EVENT, signOut);
        return () => window.removeEventListener(UNAUTHORIZED_EVENT, signOut);
    }, [signOut]);

    const value = useMemo<AuthContextValue>(
        () => ({
            user: token === null ? null : (user ?? null),
            isAuthenticated: token !== null && user !== undefined,
            isLoading: token !== null && isPending,
            signIn,
            signOut,
        }),
        [token, user, isPending, signIn, signOut],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

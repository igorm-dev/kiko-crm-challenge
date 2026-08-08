import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';
import * as authService from '@/services/auth.service';
import type { AuthUser } from '@/types/auth';

export interface AuthContextValue {
    user: AuthUser | null;
    isAuthenticated: boolean;
    /** Rejects with `AuthNotImplementedError` until the API endpoint exists. */
    signIn: (email: string, password: string) => Promise<AuthUser>;
    signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);

    const signIn = useCallback(async (email: string, password: string) => {
        const signedIn = await authService.login(email, password);
        setUser(signedIn);
        return signedIn;
    }, []);

    const signOut = useCallback(() => setUser(null), []);

    const value = useMemo<AuthContextValue>(
        () => ({ user, isAuthenticated: user !== null, signIn, signOut }),
        [user, signIn, signOut],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

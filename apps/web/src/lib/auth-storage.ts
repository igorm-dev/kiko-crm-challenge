const TOKEN_KEY = 'kiko.auth.token';

export function getToken(): string | null {
    try {
        return window.localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
}

export function setToken(token: string): void {
    try {
        window.localStorage.setItem(TOKEN_KEY, token);
    } catch {}
}

export function clearToken(): void {
    try {
        window.localStorage.removeItem(TOKEN_KEY);
    } catch {}
}

import type { ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    children?: ReactNode;
}

export function PageHeader({ title, children }: PageHeaderProps) {
    return (
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-8 py-6">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {children}
        </header>
    );
}

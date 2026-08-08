import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;

    loading?: boolean;
    children: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
    primary: 'bg-brand text-white hover:bg-brand-hover focus-visible:outline-brand',
    secondary:
        'bg-transparent text-neutral-100 border border-surface-border hover:bg-white/5 focus-visible:outline-neutral-500',
};

export function Button({
    variant = 'primary',
    loading = false,
    disabled,
    className = '',
    children,
    ...props
}: ButtonProps) {
    return (
        <button
            {...props}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            className={`flex h-12 w-full cursor-pointer items-center justify-center gap-2.5 rounded-lg text-[15px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${className}`}
        >
            {loading && <Spinner />}
            {children}
        </button>
    );
}

function Spinner() {
    return (
        <svg className="size-4 animate-spin" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeOpacity="0.3" />
            <path
                d="M14.5 8A6.5 6.5 0 0 0 8 1.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
}

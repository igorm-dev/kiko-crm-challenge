interface KikosLogoProps {
    /** Tailwind text size that drives the whole lockup, e.g. "text-2xl". */
    className?: string;
}

/**
 * The wordmark: KIKOS with the first "I" rendered as a brand-colored bar,
 * plus a small "CRM" suffix. Scales with whatever font size is applied.
 */
export function KikosLogo({ className = 'text-4xl' }: KikosLogoProps) {
    return (
        <span
            className={`inline-flex items-baseline font-extrabold tracking-tight text-white ${className}`}
            aria-label="Kikos CRM"
            role="img"
        >
            K
            <span className="mx-[0.06em] inline-block h-[0.72em] w-[0.11em] self-center bg-brand" />
            KOS
            <span className="ml-[0.12em] text-[0.36em] font-bold tracking-normal text-brand">
                CRM
            </span>
        </span>
    );
}

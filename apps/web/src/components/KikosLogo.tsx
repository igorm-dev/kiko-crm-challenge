interface KikosLogoProps {
    className?: string;
}

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

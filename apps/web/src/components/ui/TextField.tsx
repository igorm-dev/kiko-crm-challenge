import { useId, useState, type InputHTMLAttributes } from 'react';

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
    label: string;

    error?: string;
}

export function TextField({
    label,
    error,
    required,
    type,
    className = '',
    ...props
}: TextFieldProps) {
    const id = useId();
    const errorId = `${id}-error`;

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const isPassword = type === 'password';
    const resolvedType = isPassword && isPasswordVisible ? 'text' : type;

    return (
        <div className={className}>
            <label htmlFor={id} className="block text-sm font-medium text-neutral-400">
                {label}
                {required && (
                    <span className="ml-1 text-brand" aria-hidden="true">
                        *
                    </span>
                )}
            </label>

            <div className="relative">
                <input
                    {...props}
                    id={id}
                    type={resolvedType}
                    required={required}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : undefined}
                    className={`mt-2 h-12 w-full rounded-lg border bg-surface-sunken pl-4 text-[15px] text-neutral-100 transition-colors outline-none placeholder:text-neutral-600 focus:ring-1 disabled:opacity-60 ${
                        isPassword ? 'pr-12' : 'pr-4'
                    } ${
                        error
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                            : 'border-surface-border focus:border-brand focus:ring-brand'
                    }`}
                />

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setIsPasswordVisible((visible) => !visible)}
                        disabled={props.disabled}
                        aria-label={isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
                        aria-pressed={isPasswordVisible}
                        className="absolute top-2 right-0 flex h-12 w-12 cursor-pointer items-center justify-center rounded-r-lg text-neutral-500 transition-colors hover:text-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                )}
            </div>

            {error && (
                <p id={errorId} className="mt-1.5 text-xs text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
}

function EyeIcon() {
    return (
        <svg
            className="size-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

function EyeOffIcon() {
    return (
        <svg
            className="size-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M9.9 5.7A9.9 9.9 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.9 3.7" />
            <path d="M6.3 7.9A17 17 0 0 0 2.5 12S6 18.5 12 18.5c1.5 0 2.8-.4 4-1" />
            <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
            <path d="M3 3l18 18" />
        </svg>
    );
}

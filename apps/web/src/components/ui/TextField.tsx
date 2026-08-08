import { useId, type InputHTMLAttributes } from 'react';

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
    label: string;
    /** Message from validation. Its presence is what marks the field invalid. */
    error?: string;
}

export function TextField({ label, error, required, className = '', ...props }: TextFieldProps) {
    const id = useId();
    const errorId = `${id}-error`;

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

            <input
                {...props}
                id={id}
                required={required}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                className={`mt-2 h-12 w-full rounded-lg border bg-surface-sunken px-4 text-[15px] text-neutral-100 transition-colors outline-none placeholder:text-neutral-600 focus:ring-1 disabled:opacity-60 ${
                    error
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-surface-border focus:border-brand focus:ring-brand'
                }`}
            />

            {error && (
                <p id={errorId} className="mt-1.5 text-xs text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
}

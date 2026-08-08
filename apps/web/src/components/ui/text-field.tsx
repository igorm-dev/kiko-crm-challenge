import { useId, useState, type ComponentProps } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface TextFieldProps extends Omit<ComponentProps<'input'>, 'id'> {
    label: string;
    error?: string;
    containerClassName?: string;
}

export function TextField({
    label,
    error,
    required,
    type,
    containerClassName,
    className,
    ...props
}: TextFieldProps) {
    const id = useId();
    const errorId = `${id}-error`;

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const isPassword = type === 'password';
    const resolvedType = isPassword && isPasswordVisible ? 'text' : type;

    return (
        <div className={cn('grid gap-2', containerClassName)}>
            <Label htmlFor={id}>
                {label}
                {required && (
                    <span className="text-primary" aria-hidden="true">
                        *
                    </span>
                )}
            </Label>

            <div className="relative">
                <Input
                    {...props}
                    id={id}
                    type={resolvedType}
                    required={required}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : undefined}
                    className={cn('h-11', isPassword && 'pr-11', className)}
                />

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setIsPasswordVisible((visible) => !visible)}
                        disabled={props.disabled}
                        aria-label={isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
                        aria-pressed={isPasswordVisible}
                        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-60"
                    >
                        {isPasswordVisible ? (
                            <EyeOff className="size-4.5" />
                        ) : (
                            <Eye className="size-4.5" />
                        )}
                    </button>
                )}
            </div>

            {error && (
                <p id={errorId} className="text-xs text-destructive">
                    {error}
                </p>
            )}
        </div>
    );
}

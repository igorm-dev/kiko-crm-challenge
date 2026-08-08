import { useState, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ConfirmDialogProps {
    trigger: ReactNode;
    title: string;
    description?: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    isPending?: boolean;
    onConfirm: () => void;
}

export function ConfirmDialog({
    trigger,
    title,
    description,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    isPending = false,
    onConfirm,
}: ConfirmDialogProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>{cancelLabel}</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={isPending}
                        onClick={(event) => {
                            event.preventDefault();
                            onConfirm();
                            setIsOpen(false);
                        }}
                    >
                        {isPending && <Loader2 className="animate-spin" />}
                        {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

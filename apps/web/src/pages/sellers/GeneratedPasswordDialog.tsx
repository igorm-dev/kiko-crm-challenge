import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import type { GeneratedPassword } from '@kiko/contracts';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface GeneratedPasswordDialogProps {
    result: GeneratedPassword | null;
    onClose: () => void;
}

export function GeneratedPasswordDialog({ result, onClose }: GeneratedPasswordDialogProps) {
    const [hasCopied, setHasCopied] = useState(false);

    async function copy() {
        if (!result) {
            return;
        }

        try {
            await navigator.clipboard.writeText(result.generatedPassword);
            setHasCopied(true);
            setTimeout(() => setHasCopied(false), 2000);
        } catch {
            setHasCopied(false);
        }
    }

    return (
        <AlertDialog open={result !== null} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Senha de {result?.user.name}</AlertDialogTitle>
                    <AlertDialogDescription>
                        Copie agora e repasse ao vendedor. Esta senha não fica guardada e não pode
                        ser vista de novo — se perder, gere outra em &ldquo;Redefinir senha&rdquo;.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-sunken p-2">
                    <code className="flex-1 px-2 font-mono text-sm break-all text-foreground">
                        {result?.generatedPassword}
                    </code>

                    <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={copy}
                        aria-label="Copiar senha"
                        title="Copiar senha"
                    >
                        {hasCopied ? <Check className="text-primary" /> : <Copy />}
                    </Button>
                </div>

                <AlertDialogFooter>
                    <AlertDialogAction onClick={onClose}>Já copiei</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

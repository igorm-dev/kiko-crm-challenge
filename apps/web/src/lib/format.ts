const currency = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
});

const dateTime = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
});

const time = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });

export function formatCurrency(value: number): string {
    return currency.format(value);
}

export function formatDate(value: Date): string {
    return dateTime.format(value);
}

export function formatRelativeDateTime(value: Date): string {
    const today = new Date();
    const isToday = value.toDateString() === today.toDateString();

    if (isToday) {
        return `Hoje às ${time.format(value)}`;
    }

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (value.toDateString() === yesterday.toDateString()) {
        return 'Ontem';
    }

    return dateTime.format(value);
}

export function initialsOf(name: string): string {
    const parts = name.trim().split(/\s+/);
    const first = parts.at(0)?.charAt(0) ?? '';
    const last = parts.length > 1 ? (parts.at(-1)?.charAt(0) ?? '') : '';

    return (first + last).toUpperCase();
}

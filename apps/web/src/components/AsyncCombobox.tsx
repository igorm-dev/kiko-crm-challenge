import { useState, type UIEvent } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Check, ChevronDown, Loader2 } from 'lucide-react';
import type { Paginated } from '@kiko/contracts';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

export const COMBOBOX_PAGE_SIZE = 10;

const SCROLL_THRESHOLD_PX = 48;

interface AsyncComboboxProps<T> {
    value: string;
    onValueChange: (value: string) => void;
    fetchPage: (search: string, page: number) => Promise<Paginated<T>>;
    queryKey: readonly unknown[];
    getOptionValue: (item: T) => string;
    getOptionLabel: (item: T) => string;
    placeholder: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    selectedLabel?: string;
    allOption?: { value: string; label: string };
    disabled?: boolean;
    invalid?: boolean;
    className?: string;
}

export function AsyncCombobox<T>({
    value,
    onValueChange,
    fetchPage,
    queryKey,
    getOptionValue,
    getOptionLabel,
    placeholder,
    searchPlaceholder = 'Buscar...',
    emptyMessage = 'Nada encontrado.',
    selectedLabel,
    allOption,
    disabled = false,
    invalid = false,
    className,
}: AsyncComboboxProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebouncedValue(search, 300);

    const query = useInfiniteQuery({
        queryKey: [...queryKey, debouncedSearch],
        queryFn: ({ pageParam }) => fetchPage(debouncedSearch, pageParam),
        initialPageParam: 1,
        getNextPageParam: (last) => (last.page < last.pageCount ? last.page + 1 : undefined),
        enabled: isOpen,
    });

    const items = query.data?.pages.flatMap((page) => page.items) ?? [];
    const selected = items.find((item) => getOptionValue(item) === value);
    const label =
        allOption && value === allOption.value
            ? allOption.label
            : selected
              ? getOptionLabel(selected)
              : selectedLabel;

    function handleScroll(event: UIEvent<HTMLDivElement>) {
        const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
        const reachedBottom = scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD_PX;

        if (reachedBottom && query.hasNextPage && !query.isFetchingNextPage) {
            void query.fetchNextPage();
        }
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-invalid={invalid || undefined}
                    disabled={disabled}
                    className={cn(
                        'h-11 w-full justify-between border-input bg-transparent font-normal dark:bg-input/30',
                        !label && 'text-muted-foreground',
                        className,
                    )}
                >
                    <span className="truncate">{label ?? placeholder}</span>
                    <ChevronDown className="shrink-0 text-muted-foreground opacity-70" />
                </Button>
            </PopoverTrigger>

            <PopoverContent
                align="start"
                className="w-(--radix-popover-trigger-width) p-0"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <Command shouldFilter={false}>
                    <CommandInput
                        value={search}
                        onValueChange={setSearch}
                        placeholder={searchPlaceholder}
                    />

                    <CommandList onScroll={handleScroll}>
                        {query.isPending && (
                            <div className="flex justify-center py-6">
                                <Loader2 className="size-5 animate-spin text-primary" aria-hidden />
                                <span className="sr-only">Carregando…</span>
                            </div>
                        )}

                        {!query.isPending && items.length === 0 && (
                            <CommandEmpty>{emptyMessage}</CommandEmpty>
                        )}

                        {allOption && (
                            <CommandItem
                                value={allOption.value}
                                onSelect={() => {
                                    onValueChange(allOption.value);
                                    setIsOpen(false);
                                }}
                            >
                                <Check
                                    className={cn(
                                        'text-primary',
                                        allOption.value === value ? 'opacity-100' : 'opacity-0',
                                    )}
                                />
                                {allOption.label}
                            </CommandItem>
                        )}

                        {items.map((item) => {
                            const optionValue = getOptionValue(item);

                            return (
                                <CommandItem
                                    key={optionValue}
                                    value={optionValue}
                                    onSelect={() => {
                                        onValueChange(optionValue);
                                        setIsOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            'text-primary',
                                            optionValue === value ? 'opacity-100' : 'opacity-0',
                                        )}
                                    />
                                    <span className="truncate">{getOptionLabel(item)}</span>
                                </CommandItem>
                            );
                        })}

                        {query.isFetchingNextPage && (
                            <div className="flex justify-center py-3">
                                <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
                                <span className="sr-only">Carregando mais…</span>
                            </div>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

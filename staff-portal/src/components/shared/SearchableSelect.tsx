import { useState } from 'react';
import { Popover } from '@base-ui/react/popover';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  hint?: string;
}

interface SearchableSelectProps {
  value: string | null;
  valueLabel?: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
}

export function SearchableSelect({
  value,
  valueLabel,
  options,
  onChange,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  emptyMessage = 'No results found.',
  disabled,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = options.filter((option) =>
    `${option.label} ${option.hint ?? ''}`.toLowerCase().includes(normalizedQuery),
  );
  const triggerLabel =
    valueLabel ?? options.find((option) => option.value === value)?.label ?? placeholder;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setQuery('');
  };

  const handleSelect = (next: string) => {
    handleOpenChange(false);
    if (next !== value) onChange(next);
  };

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger
        disabled={disabled}
        className="flex h-8 w-full min-w-44 items-center justify-between gap-2 rounded-md border bg-background px-2.5 text-sm hover:bg-muted/50 disabled:opacity-50"
      >
        <span className="truncate">{triggerLabel}</span>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner align="start" sideOffset={4} className="z-50">
          <Popover.Popup className="w-64 rounded-lg border bg-popover text-popover-foreground shadow-md outline-none">
            <div className="relative border-b">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 w-full bg-transparent pl-9 pr-3 text-sm outline-none"
              />
            </div>

            <ul role="listbox" className="max-h-56 overflow-y-auto p-1">
              {filtered.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-muted-foreground">{emptyMessage}</li>
              )}
              {filtered.map((option) => (
                <li key={option.value} role="option" aria-selected={option.value === value}>
                  <button
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                  >
                    <Check className={cn('h-4 w-4 shrink-0', option.value === value ? 'opacity-100' : 'opacity-0')} />
                    <span className="min-w-0">
                      <span className="block truncate">{option.label}</span>
                      {option.hint && (
                        <span className="block truncate text-xs text-muted-foreground">{option.hint}</span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
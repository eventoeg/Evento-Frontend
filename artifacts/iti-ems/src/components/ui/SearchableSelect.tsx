
import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Loader2, Search } from 'lucide-react';

export interface SearchableOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: SearchableOption[];
  value: string;
  onChange: (value: string) => void;
  onSearch?: (query: string) => Promise<SearchableOption[]>;
  initialVisibleCount?: number;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  onSearch,
  initialVisibleCount = 10,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  emptyText = 'No options found',
  disabled = false,
  className = '',
}: SearchableSelectProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [remoteOptions, setRemoteOptions] = useState<SearchableOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [knownLabels, setKnownLabels] = useState<Record<string, string>>({});

  useEffect(() => {
    if (options.length === 0) return;
    setKnownLabels((prev) => {
      const next = { ...prev };
      for (const option of options) {
        next[option.value] = option.label;
      }
      return next;
    });
  }, [options]);

  useEffect(() => {
    const q = query.trim();
    if (!onSearch || !isOpen || q.length === 0) {
      if (q.length === 0) {
        setRemoteOptions([]);
      }
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    const timeout = setTimeout(async () => {
      try {
        setIsSearching(true);
        const result = await onSearch(q);
        if (cancelled) return;
        setRemoteOptions(result);
        setKnownLabels((prev) => {
          const next = { ...prev };
          for (const option of result) {
            next[option.value] = option.label;
          }
          return next;
        });
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query, onSearch, isOpen]);

  const selectedLabel = useMemo(() => {
    return knownLabels[value] ?? options.find((option) => option.value === value)?.label ?? '';
  }, [knownLabels, options, value]);

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options.slice(0, initialVisibleCount);
    if (onSearch) return remoteOptions;
    return options.filter((option) => option.label.toLowerCase().includes(q));
  }, [options, query, onSearch, remoteOptions, initialVisibleCount]);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery('');
        setRemoteOptions([]);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((open) => !open)}
        className="w-full bg-surface border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium text-left focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-between gap-2"
      >
        <span className={selectedLabel ? 'text-on-surface' : 'text-on-surface-variant'}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-on-surface-variant transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-[120] mt-2 w-full bg-white border border-outline/50 rounded-xl shadow-xl overflow-hidden">
          <div className="p-3 border-b border-outline/20">
            <div className="relative">
              <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-surface border border-outline/40 rounded-lg py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                type="text"
              />
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setQuery('');
                    setRemoteOptions([]);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-surface transition-colors flex items-center justify-between gap-2"
                >
                  <span className="text-on-surface">{option.label}</span>
                  {option.value === value && <Check className="w-4 h-4 text-primary" />}
                </button>
              ))
            ) : (
              <div className="px-4 py-4 text-sm text-on-surface-variant">{emptyText}</div>
            )}
            {isSearching && (
              <div className="px-4 py-2 text-xs text-on-surface-variant flex items-center gap-2 border-t border-outline/20">
                <Loader2 className="w-3 h-3 animate-spin" />
                Searching...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { airportService } from "@/services";
import type { Airport } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  id?: string;
  value: Airport | null;
  onChange: (a: Airport | null) => void;
  placeholder: string;
  excludeId?: string | undefined;
  invalid?: boolean;
}

export function AirportCombobox({ id, value, onChange, placeholder, excludeId, invalid }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setLoading(true);
    const t = setTimeout(() => {
      airportService
        .search(q)
        .then((r) => alive && setResults(r))
        .catch(() => alive && setResults([]))
        .finally(() => alive && setLoading(false));
    }, 200);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [q, open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid}
          className={cn(
            "h-12 w-full justify-between rounded-xl px-3 font-normal",
            !value && "text-muted-foreground",
            invalid && "border-destructive",
          )}
        >
          {value ? (
            <span className="flex min-w-0 items-center gap-2">
              <span className="rounded-md bg-secondary px-1.5 py-0.5 font-display text-xs font-bold text-secondary-foreground">
                {value.iata_code}
              </span>
              <span className="truncate">{value.city}</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <MapPin className="size-4" />
              {placeholder}
            </span>
          )}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] min-w-72 p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="City, airport or code…" value={q} onValueChange={setQ} />
          <CommandList>
            {loading && (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Searching…
              </div>
            )}
            {!loading && <CommandEmpty>No airports found.</CommandEmpty>}
            {!loading && (
              <CommandGroup>
                {results.map((a) => {
                  const disabled = a.id === excludeId;
                  return (
                    <CommandItem
                      key={a.id}
                      value={a.id}
                      disabled={disabled}
                      onSelect={() => {
                        onChange(a);
                        setOpen(false);
                        setQ("");
                      }}
                    >
                      <span className="w-10 font-display text-sm font-bold">{a.iata_code}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{a.city}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {disabled ? "Already chosen as origin" : a.airport_name}
                        </span>
                      </span>
                      <Check
                        className={cn("size-4", value?.id === a.id ? "opacity-100" : "opacity-0")}
                      />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

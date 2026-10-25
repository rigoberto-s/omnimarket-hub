import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { OrderStatus } from "@/lib/types";
import { NativeSelect } from "./native-select";
import { FILTER_STATUS_OPTIONS } from "./status-options";

type OrdersFiltersProps = {
  status: OrderStatus | "all";
  search: string;
  onStatusChange: (status: OrderStatus | "all") => void;
  onSearchChange: (search: string) => void;
};

const LABEL = "text-xs font-medium text-zinc-600";

export function OrdersFilters({ status, search, onStatusChange, onSearchChange }: OrdersFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="orders-filter-status" className={LABEL}>
          Estado
        </label>
        <NativeSelect
          id="orders-filter-status"
          wrapperClassName="w-50"
          value={status}
          onChange={(e) => onStatusChange(e.target.value as OrderStatus | "all")}
        >
          {FILTER_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="flex w-full max-w-90 flex-col gap-1.5">
        <label htmlFor="orders-filter-customer" className={LABEL}>
          Cliente
        </label>
        <div className="relative">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-500"
            aria-hidden="true"
          />
          <Input
            id="orders-filter-customer"
            type="search"
            placeholder="Buscar por cliente…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10 rounded-lg border-zinc-300 bg-white pl-9"
          />
        </div>
      </div>
    </div>
  );
}

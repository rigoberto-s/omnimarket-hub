"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useBulkUpdateOrders } from "@/hooks/use-orders";
import type { OrderStatus } from "@/lib/types";
import { NativeSelect } from "./native-select";
import { BULK_STATUS_OPTIONS, STATUS_LABELS } from "./status-options";

type BulkActionBarProps = {
  selectedIds: number[];
  onClear: () => void;
};

export function BulkActionBar({ selectedIds, onClear }: BulkActionBarProps) {
  const [status, setStatus] = useState<OrderStatus>(BULK_STATUS_OPTIONS[0]);
  const bulk = useBulkUpdateOrders();
  const count = selectedIds.length;

  function apply() {
    bulk.mutate({ ids: selectedIds, status }, { onSuccess: onClear });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5">
      <p className="text-sm font-semibold text-indigo-800" aria-live="polite">
        {count === 1 ? "1 pedido seleccionado" : `${count} pedidos seleccionados`}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="orders-bulk-status" className="text-sm text-indigo-800">
          Cambiar estado a…
        </label>
        <NativeSelect
          id="orders-bulk-status"
          wrapperClassName="w-45"
          className="h-9 border-indigo-300"
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
        >
          {BULK_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </NativeSelect>
        <Button
          onClick={apply}
          disabled={bulk.isPending}
          className="h-9 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {bulk.isPending ? "Aplicando…" : "Aplicar"}
        </Button>
        <Button
          variant="ghost"
          onClick={onClear}
          className="h-9 px-3 text-sm font-medium text-indigo-800 hover:bg-indigo-100 hover:text-indigo-900"
        >
          Limpiar
        </Button>
      </div>
    </div>
  );
}

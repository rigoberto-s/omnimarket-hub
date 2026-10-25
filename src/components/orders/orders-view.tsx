"use client";

import { useEffect, useState } from "react";
import { ErrorCard } from "@/components/dashboard/error-card";
import { useOrders } from "@/hooks/use-orders";
import { getErrorMessage } from "@/lib/api";
import type { OrderStatus } from "@/lib/types";
import { BulkActionBar } from "./bulk-action-bar";
import { OrdersFilters } from "./orders-filters";
import { OrdersTable } from "./orders-table";

const PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 300;

export function OrdersView() {
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<number>>(() => new Set());

  const { data, isPending, isError, error, refetch, isPlaceholderData } = useOrders({
    page,
    limit: PAGE_SIZE,
    status,
    q,
  });

  // Cualquier cambio de filtro o página vuelve a empezar la selección
  function resetView(nextPage = 1) {
    setPage(nextPage);
    setSelected(new Set());
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      const next = search.trim();
      if (next !== q) {
        setQ(next);
        resetView();
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search, q]);

  function changeStatus(next: OrderStatus | "all") {
    setStatus(next);
    resetView();
  }

  function clearFilters() {
    setStatus("all");
    setSearch("");
    setQ("");
    resetView();
  }

  function toggleRow(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function togglePage(checked: boolean) {
    setSelected(checked ? new Set(data?.data.map((o) => o.id)) : new Set());
  }

  const pagination = data?.pagination;
  // Solo cuentan los seleccionados que siguen visibles tras recargar
  const selectedIds = data?.data.filter((o) => selected.has(o.id)).map((o) => o.id) ?? [];

  return (
    <div className="flex flex-col gap-5">
      <OrdersFilters
        status={status}
        search={search}
        onStatusChange={changeStatus}
        onSearchChange={setSearch}
      />

      {selectedIds.length > 0 && (
        <BulkActionBar selectedIds={selectedIds} onClear={() => setSelected(new Set())} />
      )}

      {isError ? (
        <ErrorCard
          message={getErrorMessage(error, "No se pudieron cargar los pedidos.")}
          onRetry={() => refetch()}
        />
      ) : (
        <OrdersTable
          rows={data?.data}
          pagination={pagination}
          isLoading={isPending}
          hasFilters={status !== "all" || q !== ""}
          selected={selected}
          onToggleRow={toggleRow}
          onTogglePage={togglePage}
          onClearFilters={clearFilters}
          onPrevious={() => resetView(Math.max(1, page - 1))}
          onNext={() => resetView(page + 1)}
          nextDisabled={!pagination || isPlaceholderData || page >= pagination.totalPages}
        />
      )}
    </div>
  );
}

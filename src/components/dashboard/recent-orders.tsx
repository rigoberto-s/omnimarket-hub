"use client";

import { useState } from "react";
import { ClockIcon } from "lucide-react";
import { StatusBadge } from "@/components/orders/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrders } from "@/hooks/use-orders";
import { getErrorMessage } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { ErrorCard } from "./error-card";

const PAGE_SIZE = 10;
const SKELETON_ROWS = 8;

const TH = "h-10 px-3 text-left text-xs font-medium text-zinc-600 first:pl-5 last:pr-5";
const TD = "px-3 text-sm first:pl-5 last:pr-5";
const PAGER_BUTTON =
  "h-9 rounded-lg border-zinc-300 px-4 text-sm font-medium hover:border-indigo-300 hover:text-indigo-700";

function TableHeader() {
  return (
    <thead className="bg-linear-to-r from-zinc-50 to-indigo-50/50">
      <tr>
        <th scope="col" className={`${TH} w-16`}>ID</th>
        <th scope="col" className={TH}>Cliente</th>
        <th scope="col" className={TH}>Producto</th>
        <th scope="col" className={`${TH} text-right`}>Cant.</th>
        <th scope="col" className={`${TH} text-right`}>Total</th>
        <th scope="col" className={TH}>Estado</th>
        <th scope="col" className={TH}>Fecha</th>
      </tr>
    </thead>
  );
}

export function RecentOrders() {
  const [page, setPage] = useState(1);
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useOrders({
    page,
    limit: PAGE_SIZE,
  });

  if (isError) {
    return (
      <ErrorCard
        message={getErrorMessage(error, "No se pudieron cargar los pedidos.")}
        onRetry={() => refetch()}
      />
    );
  }

  const pagination = data?.pagination;

  return (
    <section
      aria-busy={isPending}
      className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm shadow-indigo-950/5 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start gap-3 p-5">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700"
          aria-hidden="true"
        >
          <ClockIcon className="size-5" />
        </span>
        <div>
          <h2 className="text-base font-semibold">Pedidos recientes</h2>
          <p className="text-sm text-zinc-600">Los más nuevos primero.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-190 border-collapse">
          <TableHeader />
          <tbody>
            {isPending &&
              Array.from({ length: SKELETON_ROWS }, (_, i) => (
                <tr key={i} className="h-13 border-b border-zinc-100">
                  <td className={TD}><Skeleton className="h-4 w-8" /></td>
                  <td className={TD}><Skeleton className="h-4 w-32" /></td>
                  <td className={TD}><Skeleton className="h-4 w-40" /></td>
                  <td className={TD}><Skeleton className="ml-auto h-4 w-6" /></td>
                  <td className={TD}><Skeleton className="ml-auto h-4 w-20" /></td>
                  <td className={TD}><Skeleton className="h-6 w-20 rounded-full" /></td>
                  <td className={TD}><Skeleton className="h-4 w-24" /></td>
                </tr>
              ))}

            {data?.data.length === 0 && (
              <tr>
                <td colSpan={7} className="h-32 text-center text-sm text-zinc-600">
                  Aún no hay pedidos.
                </td>
              </tr>
            )}

            {data?.data.map((order) => (
              <tr
                key={order.id}
                className="h-13 border-b border-zinc-100 transition-colors hover:bg-indigo-50/40"
              >
                <td className={`${TD} font-mono text-zinc-600`}>#{order.id}</td>
                <td className={`${TD} font-medium`}>{order.customer}</td>
                <td className={TD}>{order.productName ?? "—"}</td>
                <td className={`${TD} text-right tabular-nums`}>{order.quantity}</td>
                <td className={`${TD} text-right tabular-nums`}>{formatCurrency(order.totalCents)}</td>
                <td className={TD}><StatusBadge status={order.status} /></td>
                <td className={`${TD} text-zinc-600`}>{formatDate(order.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
        {pagination ? (
          <p className="text-sm text-zinc-600">
            {`Página ${pagination.page} de ${pagination.totalPages} · ${pagination.total} pedidos`}
          </p>
        ) : (
          <Skeleton className="h-4 w-48" />
        )}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className={PAGER_BUTTON}
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            className={PAGER_BUTTON}
            disabled={!pagination || isPlaceholderData || page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </section>
  );
}

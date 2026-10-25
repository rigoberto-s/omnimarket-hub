import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/format";
import type { OrderListItem, Pagination } from "@/lib/types";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./status-badge";

const SKELETON_ROWS = 10;
const COLUMNS = 8;

const TH = "px-5 py-2.5 text-left text-xs font-medium text-zinc-600";
const TD = "px-5";
const CHECKBOX = "size-4 cursor-pointer accent-indigo-600";
const PAGER_BUTTON = "h-9 rounded-lg border-zinc-300 px-4 text-sm font-medium";

type OrdersTableProps = {
  rows: OrderListItem[] | undefined;
  pagination: Pagination | undefined;
  isLoading: boolean;
  hasFilters: boolean;
  selected: ReadonlySet<number>;
  onToggleRow: (id: number) => void;
  onTogglePage: (checked: boolean) => void;
  onClearFilters: () => void;
  onPrevious: () => void;
  onNext: () => void;
  nextDisabled: boolean;
};

export function OrdersTable({
  rows,
  pagination,
  isLoading,
  hasFilters,
  selected,
  onToggleRow,
  onTogglePage,
  onClearFilters,
  onPrevious,
  onNext,
  nextDisabled,
}: OrdersTableProps) {
  const pageIds = rows?.map((r) => r.id) ?? [];
  const selectedOnPage = pageIds.filter((id) => selected.has(id)).length;
  const allSelected = pageIds.length > 0 && selectedOnPage === pageIds.length;

  return (
    <section
      aria-busy={isLoading}
      className="overflow-hidden rounded-xl border border-zinc-200 bg-white"
    >
      <div className="overflow-x-auto">
        <table data-testid="orders-table" className="w-full min-w-205 border-collapse">
          <thead className="bg-zinc-50">
            <tr>
              <th scope="col" className={cn(TH, "box-content w-6")}>
                <input
                  type="checkbox"
                  className={CHECKBOX}
                  aria-label="Seleccionar todos"
                  checked={allSelected}
                  disabled={pageIds.length === 0}
                  ref={(el) => {
                    if (el) el.indeterminate = selectedOnPage > 0 && !allSelected;
                  }}
                  onChange={(e) => onTogglePage(e.target.checked)}
                />
              </th>
              <th scope="col" className={cn(TH, "box-content w-16")}>ID</th>
              <th scope="col" className={TH}>Cliente</th>
              <th scope="col" className={TH}>Producto</th>
              <th scope="col" className={cn(TH, "box-content w-14 text-right")}>Cant.</th>
              <th scope="col" className={cn(TH, "box-content w-28 text-right")}>Total</th>
              <th scope="col" className={cn(TH, "box-content w-30")}>Estado</th>
              <th scope="col" className={cn(TH, "box-content w-28")}>Fecha</th>
            </tr>
          </thead>

          <tbody className="text-sm">
            {isLoading &&
              Array.from({ length: SKELETON_ROWS }, (_, i) => (
                <tr key={i} className="h-14 border-b border-zinc-100">
                  <td className={TD}><Skeleton className="size-4" /></td>
                  <td className={TD}><Skeleton className="h-4 w-10" /></td>
                  <td className={TD}><Skeleton className="h-4 w-32" /></td>
                  <td className={TD}><Skeleton className="h-4 w-40" /></td>
                  <td className={TD}><Skeleton className="ml-auto h-4 w-6" /></td>
                  <td className={TD}><Skeleton className="ml-auto h-4 w-20" /></td>
                  <td className={TD}><Skeleton className="h-6 w-20 rounded-full" /></td>
                  <td className={TD}><Skeleton className="h-4 w-24" /></td>
                </tr>
              ))}

            {rows?.length === 0 && (
              <tr>
                <td colSpan={COLUMNS} className="px-5 py-12 text-center">
                  {hasFilters ? (
                    <div className="flex flex-col items-center gap-3">
                      <p className="text-zinc-600">No hay pedidos con esos filtros.</p>
                      <Button
                        variant="outline"
                        onClick={onClearFilters}
                        className={PAGER_BUTTON}
                      >
                        Limpiar filtros
                      </Button>
                    </div>
                  ) : (
                    <p className="text-zinc-600">Aún no hay pedidos.</p>
                  )}
                </td>
              </tr>
            )}

            {rows?.map((order) => {
              const isSelected = selected.has(order.id);
              return (
                <tr
                  key={order.id}
                  className={cn("h-14 border-b border-zinc-100", isSelected && "bg-indigo-50/60")}
                >
                  <td className={TD}>
                    <input
                      type="checkbox"
                      className={CHECKBOX}
                      aria-label={`Seleccionar pedido #${order.id}`}
                      checked={isSelected}
                      onChange={() => onToggleRow(order.id)}
                    />
                  </td>
                  <td className={cn(TD, "font-mono text-zinc-600")}>#{order.id}</td>
                  <td className={cn(TD, "font-medium")}>{order.customer}</td>
                  <td className={cn(TD, "text-zinc-700")}>{order.productName ?? "—"}</td>
                  <td className={cn(TD, "text-right tabular-nums")}>{order.quantity}</td>
                  <td className={cn(TD, "text-right tabular-nums")}>
                    {formatCurrency(order.totalCents)}
                  </td>
                  <td className={TD}><StatusBadge status={order.status} /></td>
                  <td className={cn(TD, "whitespace-nowrap text-zinc-600")}>
                    {formatDate(order.createdAt)}
                  </td>
                </tr>
              );
            })}
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
            disabled={!pagination || pagination.page <= 1}
            onClick={onPrevious}
          >
            Anterior
          </Button>
          <Button variant="outline" className={PAGER_BUTTON} disabled={nextDisabled} onClick={onNext}>
            Siguiente
          </Button>
        </div>
      </div>
    </section>
  );
}

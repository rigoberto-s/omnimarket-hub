"use client";

import { useDroppable } from "@dnd-kit/core";
import type { OrderListItem, OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { KanbanCard } from "./kanban-card";
import { KANBAN_LIMIT } from "./kanban-config";

type KanbanColumnProps = {
  status: OrderStatus;
  title: string;
  dot: string;
  orders: OrderListItem[];
  count: number;
  /** Pedidos de este estado que no se cargaron por el límite de la API */
  truncated: boolean;
  /** Estado de la tarjeta que se arrastra, o null si no hay arrastre */
  draggingFrom: OrderStatus | null;
};

export function KanbanColumn({
  status,
  title,
  dot,
  orders,
  count,
  truncated,
  draggingFrom,
}: KanbanColumnProps) {
  // La zona de soltar es la sección completa (la prueba E2E suelta a 100 px del borde superior)
  const { setNodeRef, isOver } = useDroppable({ id: status });
  // Soltar en la misma columna no hace nada, así que no se resalta
  const highlight = isOver && draggingFrom !== null && draggingFrom !== status;

  return (
    <section
      ref={setNodeRef}
      aria-label={title}
      data-testid={`kanban-column-${status}`}
      className="flex min-w-62.5 flex-[1_1_250px] flex-col gap-3"
    >
      <div className="flex items-center gap-2 px-1">
        <span className={cn("size-2.5 rounded-full", dot)} aria-hidden="true" />
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="ml-auto inline-flex h-5.5 min-w-7 items-center justify-center rounded-full bg-zinc-200 px-2 text-xs font-medium text-zinc-800 tabular-nums">
          {count}
        </span>
      </div>

      <div
        className={cn(
          "flex h-190 flex-col gap-2.5 overflow-y-auto rounded-xl p-3 transition-colors",
          highlight
            ? "border-2 border-dashed border-indigo-400 bg-indigo-50"
            : "border border-transparent bg-zinc-100",
        )}
      >
        {orders.map((order) => (
          <KanbanCard key={order.id} order={order} />
        ))}

        {orders.length === 0 && !highlight && (
          <p className="py-6 text-center text-[13px] text-zinc-500">Sin pedidos</p>
        )}

        {truncated && (
          <p className="py-2 text-center text-xs text-zinc-500">
            {`Mostrando ${KANBAN_LIMIT} de ${count}`}
          </p>
        )}

        {highlight && (
          <div className="flex h-26 shrink-0 items-center justify-center rounded-[10px] border-2 border-dashed border-indigo-400 bg-indigo-100 text-[13px] font-medium text-indigo-800">
            Soltar aquí
          </div>
        )}
      </div>
    </section>
  );
}

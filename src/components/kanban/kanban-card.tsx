"use client";

import { useDraggable } from "@dnd-kit/core";
import { GripVerticalIcon } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import type { OrderListItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { shortDate } from "./kanban-config";

const CARD = "flex flex-col gap-2 rounded-[10px] border bg-white p-3";

function CardBody({ order }: { order: OrderListItem }) {
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-xs text-zinc-600">
          #{order.id} · {shortDate(order.createdAt)}
        </p>
        <GripVerticalIcon className="size-4 text-zinc-500" aria-hidden="true" />
      </div>
      <p className="text-sm font-semibold">{order.customer}</p>
      <p className="text-[13px] text-zinc-600">
        {order.productName ?? "—"} × {order.quantity}
      </p>
      <p className="text-sm font-semibold tabular-nums">{formatCurrency(order.totalCents)}</p>
    </>
  );
}

/** Tarjeta en su columna: es la que se arrastra y la que buscan las pruebas E2E. */
export function KanbanCard({ order }: { order: OrderListItem }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `order-${order.id}`,
    data: { order },
    attributes: { roleDescription: "tarjeta arrastrable" },
  });

  return (
    <article
      ref={setNodeRef}
      data-testid={`kanban-card-${order.id}`}
      {...attributes}
      {...listeners}
      className={cn(
        CARD,
        "cursor-grab touch-none border-zinc-200 outline-none focus-visible:ring-3 focus-visible:ring-indigo-600/30",
        isDragging && "opacity-40",
      )}
    >
      <CardBody order={order} />
    </article>
  );
}

/** Copia elevada que sigue al puntero (DragOverlay). Sin data-testid para no duplicarlo. */
export function KanbanCardOverlay({ order }: { order: OrderListItem }) {
  return (
    <article className={cn(CARD, "rotate-2 cursor-grabbing border-indigo-600 shadow-xl")}>
      <CardBody order={order} />
    </article>
  );
}

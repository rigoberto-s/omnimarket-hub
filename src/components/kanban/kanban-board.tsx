"use client";

import { useState } from "react";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  pointerWithin,
  PointerSensor,
  useSensor,
  useSensors,
  type Active,
  type Announcements,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
  type KeyboardCoordinateGetter,
  type Over,
} from "@dnd-kit/core";
import { ErrorCard } from "@/components/dashboard/error-card";
import { useOrders, useUpdateOrderStatus } from "@/hooks/use-orders";
import { getErrorMessage } from "@/lib/api";
import { ORDER_STATUSES } from "@/lib/schemas";
import type { OrderListItem, OrderStatus } from "@/lib/types";
import { KanbanCardOverlay } from "./kanban-card";
import { KanbanColumn } from "./kanban-column";
import { KANBAN_COLUMNS, KANBAN_LIMIT } from "./kanban-config";
import { KanbanSkeleton } from "./kanban-skeleton";

type Entry = { order: OrderListItem; origin: OrderStatus };

const TITLES = Object.fromEntries(KANBAN_COLUMNS.map((c) => [c.status, c.title])) as Record<
  OrderStatus,
  string
>;

const orderOf = (active: Active) => (active.data.current as { order: OrderListItem }).order;
const titleOf = (over: Over | null) => (over ? TITLES[over.id as OrderStatus] : null);

// Con puntero manda la columna bajo el cursor; con teclado (sin puntero), la más cercana
const collisionDetection: CollisionDetection = (args) => {
  const hits = pointerWithin(args);
  return hits.length > 0 ? hits : closestCenter(args);
};

/** ←/→ llevan la tarjeta al centro de la columna vecina. */
const columnKeyboardCoordinates: KeyboardCoordinateGetter = (event, { context }) => {
  if (event.code !== "ArrowRight" && event.code !== "ArrowLeft") return undefined;
  const { collisionRect, droppableRects, over } = context;
  if (!collisionRect) return undefined;

  const columns = [...droppableRects.entries()].sort(([, a], [, b]) => a.left - b.left);
  const centerX = collisionRect.left + collisionRect.width / 2;
  const current = over
    ? columns.findIndex(([id]) => id === over.id)
    : columns.findIndex(([, r]) => centerX >= r.left && centerX <= r.right);
  const target = columns[current + (event.code === "ArrowRight" ? 1 : -1)]?.[1];
  if (!target) return undefined;

  event.preventDefault();
  return { x: target.left + target.width / 2 - collisionRect.width / 2, y: collisionRect.top };
};

const announcements: Announcements = {
  onDragStart: ({ active }) => `Tomaste el pedido #${orderOf(active).id}.`,
  onDragOver: ({ active, over }) =>
    over
      ? `El pedido #${orderOf(active).id} está sobre la columna ${titleOf(over)}.`
      : `El pedido #${orderOf(active).id} no está sobre ninguna columna.`,
  onDragEnd: ({ active, over }) =>
    over
      ? `Soltaste el pedido #${orderOf(active).id} en la columna ${titleOf(over)}.`
      : `Soltaste el pedido #${orderOf(active).id} fuera de las columnas.`,
  onDragCancel: ({ active }) => `Se canceló el movimiento del pedido #${orderOf(active).id}.`,
};

const screenReaderInstructions = {
  draggable:
    "Para tomar un pedido, presiona Espacio o Enter. Usa las flechas izquierda y derecha para " +
    "cambiar de columna. Presiona Espacio o Enter para soltarlo, o Escape para cancelar.",
};

export function KanbanBoard() {
  // Una consulta por estado: cada columna cabe en una página (máximo 200 de la API)
  const pending = useOrders({ status: "pending", limit: KANBAN_LIMIT });
  const preparing = useOrders({ status: "preparing", limit: KANBAN_LIMIT });
  const shipped = useOrders({ status: "shipped", limit: KANBAN_LIMIT });
  const delivered = useOrders({ status: "delivered", limit: KANBAN_LIMIT });
  const queries = { pending, preparing, shipped, delivered };
  const all = [pending, preparing, shipped, delivered];

  const updateStatus = useUpdateOrderStatus();
  const [active, setActive] = useState<OrderListItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: columnKeyboardCoordinates }),
  );

  if (all.some((q) => q.isError)) {
    const error = all.find((q) => q.isError)?.error;
    return (
      <ErrorCard
        message={getErrorMessage(error, "No se pudieron cargar los pedidos.")}
        onRetry={() => all.forEach((q) => q.isError && q.refetch())}
      />
    );
  }

  if (all.some((q) => q.isPending)) return <KanbanSkeleton />;

  // Se agrupa por el estado actual del pedido, no por la consulta de la que vino:
  // el hook optimista cambia el estado dentro de la lista en caché
  const entries = new Map<number, Entry>();
  for (const status of ORDER_STATUSES) {
    for (const order of queries[status].data?.data ?? []) {
      if (!entries.has(order.id)) entries.set(order.id, { order, origin: status });
    }
  }
  // Mientras el hook prepara su cambio en caché, la tarjeta ya se muestra en su nueva columna
  if (updateStatus.isPending && updateStatus.variables) {
    const { id, status } = updateStatus.variables;
    const entry = entries.get(id);
    if (entry) entries.set(id, { ...entry, order: { ...entry.order, status } });
  }

  const columns = KANBAN_COLUMNS.map((column) => {
    const page = queries[column.status].data;
    const list = [...entries.values()];
    const orders = list
      .filter((e) => e.order.status === column.status)
      .map((e) => e.order)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id);
    // Total del servidor, ajustado por los pedidos que entraron o salieron sin recargar
    const left = list.filter((e) => e.origin === column.status && e.order.status !== column.status);
    const arrived = list.filter((e) => e.origin !== column.status && e.order.status === column.status);
    const total = page?.pagination.total ?? 0;
    return {
      ...column,
      orders,
      count: total - left.length + arrived.length,
      truncated: total > (page?.data.length ?? 0),
    };
  });

  function handleDragStart({ active }: DragStartEvent) {
    setActive(orderOf(active));
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActive(null);
    if (!over) return;
    const order = orderOf(active);
    const status = over.id as OrderStatus;
    if (order.status === status) return;
    updateStatus.mutate({ id: order.id, status });
  }

  return (
    <DndContext
      id="kanban-board"
      sensors={sensors}
      collisionDetection={collisionDetection}
      accessibility={{ announcements, screenReaderInstructions }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActive(null)}
    >
      <div className="flex items-start gap-4 overflow-x-auto pb-2">
        {columns.map((column) => (
          <KanbanColumn
            key={column.status}
            status={column.status}
            title={column.title}
            dot={column.dot}
            orders={column.orders}
            count={column.count}
            truncated={column.truncated}
            draggingFrom={active?.status ?? null}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {active && <KanbanCardOverlay order={active} />}
      </DragOverlay>
    </DndContext>
  );
}

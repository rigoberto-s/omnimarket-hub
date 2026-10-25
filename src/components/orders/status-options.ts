import type { OrderStatus } from "@/lib/types";

/** Mismas etiquetas que StatusBadge, para las opciones de los <select>. */
export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pendiente",
  preparing: "Preparando",
  shipped: "Enviado",
  delivered: "Entregado",
};

export const FILTER_STATUS_OPTIONS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "pending", label: STATUS_LABELS.pending },
  { value: "preparing", label: STATUS_LABELS.preparing },
  { value: "shipped", label: STATUS_LABELS.shipped },
  { value: "delivered", label: STATUS_LABELS.delivered },
];

export const BULK_STATUS_OPTIONS: OrderStatus[] = ["preparing", "pending", "shipped", "delivered"];

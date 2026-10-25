import { STATUS_LABELS } from "@/components/orders/status-options";
import { formatDate } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

/** Máximo que acepta GET /api/orders por página. */
export const KANBAN_LIMIT = 200;

// #D97706, #2563EB, #7C3AED, #16A34A
export const KANBAN_COLUMNS: { status: OrderStatus; title: string; dot: string }[] = [
  { status: "pending", title: STATUS_LABELS.pending, dot: "bg-amber-600" },
  { status: "preparing", title: STATUS_LABELS.preparing, dot: "bg-blue-600" },
  { status: "shipped", title: STATUS_LABELS.shipped, dot: "bg-violet-600" },
  { status: "delivered", title: STATUS_LABELS.delivered, dot: "bg-green-600" },
];

/** "24 oct 2026" -> "24 oct" (sale de formatDate, sin formatear a mano). */
export const shortDate = (iso: string) => formatDate(iso).replace(/\s\d{4}$/, "");

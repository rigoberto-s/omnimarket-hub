import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

const STATUS_STYLES: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "Pendiente", className: "bg-amber-100 text-amber-800" },
  preparing: { label: "Preparando", className: "bg-blue-100 text-blue-800" },
  shipped: { label: "Enviado", className: "bg-violet-100 text-violet-800" },
  delivered: { label: "Entregado", className: "bg-green-100 text-green-800" },
};

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const { label, className: colors } = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium whitespace-nowrap",
        colors,
        className,
      )}
    >
      {label}
    </span>
  );
}

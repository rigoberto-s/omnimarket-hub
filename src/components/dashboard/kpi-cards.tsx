import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import type { Analytics } from "@/lib/types";

const GRID = "grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4";
const CARD = "flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-5";

function KpiCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className={CARD}>
      <p className="text-sm text-zinc-600">{label}</p>
      <p className="text-[28px] leading-tight font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-zinc-600">{hint}</p>
    </div>
  );
}

export function KpiCards({ kpis }: { kpis: Analytics["kpis"] }) {
  return (
    <div className={GRID}>
      <KpiCard
        label="Ventas totales"
        value={formatCurrency(kpis.totalSalesCents)}
        hint="Suma de todos los pedidos"
      />
      <KpiCard label="Pedidos" value={String(kpis.ordersCount)} hint="Pedidos registrados" />
      <KpiCard
        label="Ticket promedio"
        value={formatCurrency(kpis.averageTicketCents)}
        hint="Total entre pedidos"
      />
      <KpiCard
        label="Margen bruto"
        value={`${kpis.grossMarginPct.toFixed(1)} %`}
        hint="Ingreso menos costo"
      />
    </div>
  );
}

export function KpiCardsSkeleton() {
  return (
    <div className={GRID}>
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className={CARD}>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

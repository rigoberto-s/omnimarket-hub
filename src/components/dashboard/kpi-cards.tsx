import {
  ReceiptIcon,
  ShoppingCartIcon,
  TrendingUpIcon,
  WalletIcon,
  type LucideIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import type { Analytics } from "@/lib/types";
import { cn } from "@/lib/utils";

const GRID = "grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4";
const CARD = "flex flex-col gap-2 rounded-2xl p-5";
const WHITE_CARD = "border border-zinc-200 bg-white shadow-sm shadow-indigo-950/5";
// Elevación al pasar el ratón solo si el usuario no pidió reducir movimiento
const HOVER = "transition-shadow hover:shadow-md motion-safe:transition motion-safe:hover:-translate-y-0.5";
const ICON_TILE = "flex size-9 shrink-0 items-center justify-center rounded-xl";

type Tone = "featured" | "violet" | "sky" | "emerald";

const TONES: Record<Tone, { card: string; label: string; hint: string; icon: string }> = {
  // Texto blanco e indigo-100 sobre indigo-600 → violet-600: contraste ≥ 4.9:1
  featured: {
    card: "border border-transparent bg-linear-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/25",
    label: "text-indigo-100",
    hint: "text-indigo-100",
    icon: "bg-white/15 text-white",
  },
  violet: { card: WHITE_CARD, label: "text-zinc-600", hint: "text-zinc-600", icon: "bg-violet-50 text-violet-700" },
  sky: { card: WHITE_CARD, label: "text-zinc-600", hint: "text-zinc-600", icon: "bg-sky-50 text-sky-700" },
  emerald: { card: WHITE_CARD, label: "text-zinc-600", hint: "text-zinc-600", icon: "bg-emerald-50 text-emerald-700" },
};

type KpiCardProps = { label: string; value: string; hint: string; icon: LucideIcon; tone: Tone };

function KpiCard({ label, value, hint, icon: Icon, tone }: KpiCardProps) {
  const t = TONES[tone];
  return (
    <div className={cn(CARD, HOVER, t.card)}>
      <div className="flex items-start justify-between gap-3">
        <p className={cn("text-sm", t.label)}>{label}</p>
        <span className={cn(ICON_TILE, t.icon)} aria-hidden="true">
          <Icon className="size-5" />
        </span>
      </div>
      <p className="text-[28px] leading-tight font-semibold tabular-nums">{value}</p>
      <p className={cn("text-xs", t.hint)}>{hint}</p>
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
        icon={WalletIcon}
        tone="featured"
      />
      <KpiCard
        label="Pedidos"
        value={String(kpis.ordersCount)}
        hint="Pedidos registrados"
        icon={ShoppingCartIcon}
        tone="violet"
      />
      <KpiCard
        label="Ticket promedio"
        value={formatCurrency(kpis.averageTicketCents)}
        hint="Total entre pedidos"
        icon={ReceiptIcon}
        tone="sky"
      />
      <KpiCard
        label="Margen bruto"
        value={`${kpis.grossMarginPct.toFixed(1)} %`}
        hint="Ingreso menos costo"
        icon={TrendingUpIcon}
        tone="emerald"
      />
    </div>
  );
}

/** Mismas medidas que KpiCard (radio, padding y cuadro de icono) para que no haya salto al cargar. */
export function KpiCardsSkeleton() {
  return (
    <div className={GRID}>
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className={cn(CARD, WHITE_CARD)}>
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className={cn(ICON_TILE, "bg-zinc-100")} />
          </div>
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

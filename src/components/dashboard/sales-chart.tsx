"use client";

import { useId } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Analytics } from "@/lib/types";

type SalesPoint = Analytics["salesByDay"][number];

const ZINC_100 = "#F4F4F5";
const ZINC_600 = "#52525B";
const INDIGO_50 = "#EEF2FF";
// Degradados: blue-500 → violet-600 y, para la barra más alta, orange-500 → orange-600
const BAR_TOP = "#3B82F6";
const BAR_BOTTOM = "#7C3AED";
const PEAK_TOP = "#F97316";
const PEAK_BOTTOM = "#EA580C";

/** "25 sep 2026" -> "25 sep" (sale de formatDate, sin formatear a mano). */
const shortDate = (day: string) => formatDate(day).replace(/\s\d{4}$/, "");

/** formatCurrency sin decimales para el eje: 1200000 -> "$12,000". */
const axisCurrency = (cents: number) =>
  formatCurrency(Math.round(cents / 100) * 100).replace(/\.00$/, "");

function SalesTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload: SalesPoint }>;
}) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs shadow-lg shadow-indigo-950/10">
      <p className="text-zinc-600">{formatDate(point.date)}</p>
      <p className="font-semibold text-indigo-700 tabular-nums">{formatCurrency(point.totalCents)}</p>
    </div>
  );
}

export function SalesChart({ data }: { data: SalesPoint[] }) {
  // Ids únicos y válidos en url(#...) para no chocar con otros SVG de la página
  const baseId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const barGradient = `sales-bar-${baseId}`;
  const peakGradient = `sales-peak-${baseId}`;

  // Índice de la barra más alta (si hay empate, la primera)
  const peakIndex = data.reduce(
    (best, point, i) => (point.totalCents > data[best].totalCents ? i : best),
    0,
  );

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={barGradient} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BAR_TOP} />
            <stop offset="100%" stopColor={BAR_BOTTOM} />
          </linearGradient>
          <linearGradient id={peakGradient} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PEAK_TOP} />
            <stop offset="100%" stopColor={PEAK_BOTTOM} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={ZINC_100} />
        <XAxis
          dataKey="date"
          tickFormatter={shortDate}
          tick={{ fontSize: 12, fill: ZINC_600 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
          minTickGap={40}
          tickMargin={8}
        />
        <YAxis
          tickFormatter={axisCurrency}
          tick={{ fontSize: 12, fill: ZINC_600 }}
          tickLine={false}
          axisLine={false}
          tickCount={4}
          width={64}
        />
        <Tooltip content={<SalesTooltip />} cursor={{ fill: INDIGO_50 }} />
        <Bar dataKey="totalCents" radius={[3, 3, 0, 0]}>
          {data.map((point, i) => (
            <Cell
              key={point.date}
              fill={`url(#${i === peakIndex ? peakGradient : barGradient})`}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

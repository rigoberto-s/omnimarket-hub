"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Analytics } from "@/lib/types";

type SalesPoint = Analytics["salesByDay"][number];

const INDIGO_600 = "#4F46E5";
const ZINC_100 = "#F4F4F5";
const ZINC_600 = "#52525B";

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
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs shadow-sm">
      <p className="text-zinc-600">{formatDate(point.date)}</p>
      <p className="font-semibold tabular-nums">{formatCurrency(point.totalCents)}</p>
    </div>
  );
}

export function SalesChart({ data }: { data: SalesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
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
        <Tooltip content={<SalesTooltip />} cursor={{ fill: ZINC_100 }} />
        <Bar dataKey="totalCents" fill={INDIGO_600} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

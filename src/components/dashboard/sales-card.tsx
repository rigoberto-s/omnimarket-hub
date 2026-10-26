"use client";

import dynamic from "next/dynamic";
import { BarChart3Icon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Analytics } from "@/lib/types";

// Recharts mide el DOM: se renderiza solo en cliente para evitar errores de hidratación
const SalesChart = dynamic(() => import("./sales-chart").then((m) => m.SalesChart), {
  ssr: false,
  loading: () => <Skeleton className="h-60 w-full rounded-xl" />,
});

function SalesCardFrame({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm shadow-indigo-950/5">
      <div className="flex items-start gap-3">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700"
          aria-hidden="true"
        >
          <BarChart3Icon className="size-5" />
        </span>
        <div>
          <h2 className="text-base font-semibold">Ventas por día</h2>
          <p className="text-sm text-zinc-600">Últimos 30 días</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export function SalesCard({ data }: { data: Analytics["salesByDay"] }) {
  return (
    <SalesCardFrame>
      <SalesChart data={data} />
    </SalesCardFrame>
  );
}

export function SalesCardSkeleton() {
  return (
    <SalesCardFrame>
      <Skeleton className="h-60 w-full rounded-xl" />
    </SalesCardFrame>
  );
}

"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { Analytics } from "@/lib/types";

// Recharts mide el DOM: se renderiza solo en cliente para evitar errores de hidratación
const SalesChart = dynamic(() => import("./sales-chart").then((m) => m.SalesChart), {
  ssr: false,
  loading: () => <Skeleton className="h-60 w-full" />,
});

function SalesCardFrame({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5">
      <div>
        <h2 className="text-base font-semibold">Ventas por día</h2>
        <p className="text-sm text-zinc-600">Últimos 30 días</p>
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
      <Skeleton className="h-60 w-full" />
    </SalesCardFrame>
  );
}

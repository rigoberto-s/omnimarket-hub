"use client";

import { useAnalytics } from "@/hooks/use-analytics";
import { getErrorMessage } from "@/lib/api";
import { ErrorCard } from "./error-card";
import { KpiCards, KpiCardsSkeleton } from "./kpi-cards";
import { RecentOrders } from "./recent-orders";
import { SalesCard, SalesCardSkeleton } from "./sales-card";

export function DashboardView() {
  const { data, isPending, isError, error, refetch } = useAnalytics();

  return (
    <div className="flex flex-col gap-6">
      {isPending ? (
        <div aria-busy="true" className="flex flex-col gap-6">
          <KpiCardsSkeleton />
          <SalesCardSkeleton />
        </div>
      ) : isError ? (
        <ErrorCard
          message={getErrorMessage(error, "No se pudieron cargar los indicadores.")}
          onRetry={() => refetch()}
        />
      ) : (
        <>
          <KpiCards kpis={data.kpis} />
          <SalesCard data={data.salesByDay} />
        </>
      )}

      <RecentOrders />
    </div>
  );
}

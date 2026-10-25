import { NextRequest, NextResponse } from "next/server";
import { desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { orders, products } from "@/db/schema";
import { grossMargin, buildPagination } from "@/lib/metrics";
import { paginationQuerySchema } from "@/lib/schemas";

export async function getAnalytics({ page, limit }: { page: number; limit: number }) {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const day = sql<string>`to_char(date_trunc('day', ${orders.createdAt}), 'YYYY-MM-DD')`;

  // Las tres consultas corren en paralelo y todo se agrega en SQL
  const [[totals], salesByDay, data] = await Promise.all([
    db
      .select({
        ordersCount: sql<number>`count(*)::int`,
        totalSalesCents: sql<number>`coalesce(sum(${orders.totalCents}), 0)::float8`,
        totalCostCents: sql<number>`coalesce(sum(${orders.costCents}), 0)::float8`,
      })
      .from(orders),
    db
      .select({ date: day, totalCents: sql<number>`sum(${orders.totalCents})::float8` })
      .from(orders)
      .where(gte(orders.createdAt, since))
      .groupBy(day)
      .orderBy(day),
    db
      .select({
        id: orders.id,
        customer: orders.customer,
        productId: orders.productId,
        productName: products.name,
        quantity: orders.quantity,
        totalCents: orders.totalCents,
        costCents: orders.costCents,
        status: orders.status,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
      })
      .from(orders)
      .innerJoin(products, eq(orders.productId, products.id))
      .orderBy(desc(orders.createdAt), desc(orders.id))
      .limit(limit)
      .offset((page - 1) * limit),
  ]);

  return {
    kpis: {
      totalSalesCents: totals.totalSalesCents,
      ordersCount: totals.ordersCount,
      averageTicketCents:
        totals.ordersCount === 0 ? 0 : Math.round(totals.totalSalesCents / totals.ordersCount),
      grossMarginPct: grossMargin(totals.totalSalesCents, totals.totalCostCents),
    },
    salesByDay,
    data,
    pagination: buildPagination(totals.ordersCount, page, limit),
  };
}

/** Handler compartido por /api/test/analytics y /api/analytics */
export async function analyticsResponse(req: NextRequest) {
  // Object.fromEntries evita que un parámetro ausente llegue como null a z.coerce
  const parsed = paginationQuerySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Parámetros inválidos", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  try {
    const started = performance.now();
    const result = await getAnalytics(parsed.data);
    return NextResponse.json(
      { ...result, elapsedMs: Math.round(performance.now() - started) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("analytics error", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

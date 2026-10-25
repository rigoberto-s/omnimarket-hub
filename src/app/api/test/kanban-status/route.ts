import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { ORDER_STATUSES } from "@/lib/schemas";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("orderId");

  // Sin orderId: conteo de pedidos por estado
  if (raw === null) {
    const rows = await db
      .select({ status: orders.status, count: sql<number>`count(*)::int` })
      .from(orders)
      .groupBy(orders.status);
    const counts = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0])) as Record<string, number>;
    for (const r of rows) counts[r.status] = r.count;
    return NextResponse.json(
      { counts },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const parsed = z.coerce.number().int().positive().safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "orderId inválido" }, { status: 400 });
  }

  const [order] = await db
    .select({ orderId: orders.id, status: orders.status, updatedAt: orders.updatedAt })
    .from(orders)
    .where(eq(orders.id, parsed.data));

  if (!order) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }
  return NextResponse.json(order, { headers: { "Cache-Control": "no-store" } });
}

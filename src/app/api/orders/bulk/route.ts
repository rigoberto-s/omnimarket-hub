import { NextRequest, NextResponse } from "next/server";
import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { bulkUpdateSchema } from "@/lib/schemas";

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = bulkUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const { ids, status } = parsed.data;

  // Una sola consulta SQL para todos los pedidos.
  const updated = await db
    .update(orders)
    .set({ status, updatedAt: new Date() })
    .where(inArray(orders.id, ids))
    .returning({ id: orders.id });

  return NextResponse.json({ updated: updated.length });
}
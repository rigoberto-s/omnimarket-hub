import { NextRequest, NextResponse } from "next/server";
import { count, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { orders, products } from "@/db/schema";

const productUpdateSchema = z
  .object({
    name: z.string().min(1),
    sku: z.string().min(1),
    category: z.string().min(1),
    priceCents: z.number().int().min(0),
    costCents: z.number().int().min(0),
    stock: z.number().int().min(0),
  })
  .partial();

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) {
    return NextResponse.json({ error: "Id inválido" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const parsed = productUpdateSchema.safeParse(body);
  if (!parsed.success || Object.keys(parsed.data).length === 0) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.success ? [] : parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const [updated] = await db
      .update(products)
      .set(parsed.data)
      .where(eq(products.id, productId))
      .returning();
    if (!updated) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "No se pudo editar (¿SKU repetido?)" }, { status: 409 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) {
    return NextResponse.json({ error: "Id inválido" }, { status: 400 });
  }

  const [{ total }] = await db
    .select({ total: count() })
    .from(orders)
    .where(eq(orders.productId, productId));
  if (total > 0) {
    return NextResponse.json(
      { error: "El producto tiene pedidos asociados" },
      { status: 409 },
    );
  }

  const [deleted] = await db
    .delete(products)
    .where(eq(products.id, productId))
    .returning({ id: products.id });
  if (!deleted) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }
  return NextResponse.json({ deleted: true });
}
import { NextRequest, NextResponse } from "next/server";
import { and, count, desc, eq, ilike } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { orders, products } from "@/db/schema";
import { buildPagination } from "@/lib/metrics";
import { orderCreateSchema, orderStatusSchema, paginationQuerySchema } from "@/lib/schemas";

const listQuerySchema = paginationQuerySchema.extend({
  status: orderStatusSchema.optional(),
  q: z.string().trim().max(80).optional(),
});

export async function GET(req: NextRequest) {
  // Los parámetros vacíos (?status=&q=) cuentan como ausentes
  const params = Object.fromEntries(
    [...req.nextUrl.searchParams].filter(([, value]) => value !== ""),
  );
  const parsed = listQuerySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Parámetros inválidos", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const { status, q, page, limit } = parsed.data;

  const where = and(
    status ? eq(orders.status, status) : undefined,
    q ? ilike(orders.customer, `%${q}%`) : undefined,
  );

  const [[{ total }], rows] = await Promise.all([
    db.select({ total: count() }).from(orders).where(where),
    db
      .select({ order: orders, productName: products.name })
      .from(orders)
      .innerJoin(products, eq(orders.productId, products.id))
      .where(where)
      .orderBy(desc(orders.createdAt), desc(orders.id))
      .limit(limit)
      .offset((page - 1) * limit),
  ]);

  return NextResponse.json({
    data: rows.map((r) => ({ ...r.order, productName: r.productName })),
    pagination: buildPagination(total, page, limit),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = orderCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, data.productId))
    .limit(1);
  if (!product) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  // El servidor calcula los montos; nunca se confía en lo que manda el cliente.
  const [created] = await db
    .insert(orders)
    .values({
      customer: data.customer,
      productId: data.productId,
      quantity: data.quantity,
      totalCents: product.priceCents * data.quantity,
      costCents: product.costCents * data.quantity,
    })
    .returning();

  return NextResponse.json({ ...created, productName: product.name }, { status: 201 });
}

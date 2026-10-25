import { NextRequest, NextResponse } from "next/server";
import { and, count, desc, eq, ilike } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { orders, products } from "@/db/schema";
import { ORDER_STATUSES, orderCreateSchema } from "@/lib/schemas";

const listQuerySchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(20),
});

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const parsed = listQuerySchema.safeParse({
    status: sp.get("status") || undefined,
    q: sp.get("q") || undefined,
    page: sp.get("page") || undefined,
    limit: sp.get("limit") || undefined,
  });
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

  const [{ total }] = await db.select({ total: count() }).from(orders).where(where);

  const rows = await db
    .select({ order: orders, productName: products.name })
    .from(orders)
    .leftJoin(products, eq(orders.productId, products.id))
    .where(where)
    .orderBy(desc(orders.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  return NextResponse.json({
    data: rows.map((r) => ({ ...r.order, productName: r.productName })),
    // Si Rigoberto tiene buildPagination, sustituye este objeto por buildPagination(...)
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
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

  return NextResponse.json(created, { status: 201 });
}
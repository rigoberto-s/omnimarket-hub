import { NextRequest, NextResponse } from "next/server";
import { and, count, desc, eq, ilike } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { orders, products } from "@/db/schema";
import { orderCreateSchema } from "@/lib/schemas";
import { buildPagination } from "@/lib/pagination"; // <- ajusta la ruta si es otra

type OrderStatus = (typeof orders.$inferSelect)["status"];

const listQuerySchema = z.object({
  status: z.string().optional(),
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
    status ? eq(orders.status, status as OrderStatus) : undefined,
    q ? ilike(orders.customerName, `%${q}%`) : undefined,
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
  const totalCents = product.priceCents * data.quantity;
  const costCents = product.costCents * data.quantity;

  const [created] = await db
    .insert(orders)
    .values({ ...data, totalCents, costCents })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
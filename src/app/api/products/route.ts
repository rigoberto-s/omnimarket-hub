import { NextRequest, NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { products } from "@/db/schema";

const productInputSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  category: z.string().min(1),
  priceCents: z.number().int().min(0),
  costCents: z.number().int().min(0),
  stock: z.number().int().min(0).default(0),
});

export async function GET() {
  const rows = await db.select().from(products).orderBy(asc(products.name));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = productInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  try {
    const [created] = await db.insert(products).values(parsed.data).returning();
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "No se pudo crear (¿SKU repetido?)" }, { status: 409 });
  }
}
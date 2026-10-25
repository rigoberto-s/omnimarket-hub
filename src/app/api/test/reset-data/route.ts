import { NextResponse } from "next/server";
import { seedDatabase } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = await seedDatabase();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("reset-data error", err);
    return NextResponse.json({ error: "No se pudo restablecer" }, { status: 500 });
  }
}

import { describe, it, expect } from "vitest";
import { orderCreateSchema, paginationQuerySchema } from "@/lib/schemas";

describe("orderCreateSchema", () => {
  it("acepta un pedido válido", () => {
    const r = orderCreateSchema.safeParse({ customer: "Ana Torres", productId: 3, quantity: 2 });
    expect(r.success).toBe(true);
  });
  it("rechaza cantidad 0, cliente vacío o productId negativo", () => {
    expect(orderCreateSchema.safeParse({ customer: "Ana", productId: 1, quantity: 0 }).success).toBe(false);
    expect(orderCreateSchema.safeParse({ customer: "", productId: 1, quantity: 1 }).success).toBe(false);
    expect(orderCreateSchema.safeParse({ customer: "Ana", productId: -1, quantity: 1 }).success).toBe(false);
  });
});

describe("paginationQuerySchema", () => {
  it("aplica page=1 y limit=50 por defecto y rechaza limit mayor a 200", () => {
    expect(paginationQuerySchema.parse({})).toEqual({ page: 1, limit: 50 });
    expect(paginationQuerySchema.safeParse({ limit: 201 }).success).toBe(false);
  });
});

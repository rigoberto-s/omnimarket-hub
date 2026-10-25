import { describe, it, expect } from "vitest";
import { filterOrders } from "@/lib/metrics";

const data = [
  { id: 1, status: "pending", customer: "Ana Torres" },
  { id: 2, status: "shipped", customer: "Luis Hernández" },
  { id: 3, status: "pending", customer: "Mariana Soto" },
];

describe("filterOrders", () => {
  it("filtra por estado y por texto del cliente sin importar mayúsculas", () => {
    expect(filterOrders(data, { status: "pending" }).map((o) => o.id)).toEqual([1, 3]);
    expect(filterOrders(data, { q: "ANA" }).map((o) => o.id)).toEqual([1, 3]);
    expect(filterOrders(data, { status: "pending", q: "torres" }).map((o) => o.id)).toEqual([1]);
  });
});

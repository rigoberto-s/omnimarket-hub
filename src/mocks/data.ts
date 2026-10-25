import { averageTicket, buildPagination, grossMargin } from "@/lib/metrics";
import { ORDER_STATUSES } from "@/lib/schemas";
import type { Analytics, Order, PaginationQuery, Product } from "@/lib/types";

export const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/** Fecha fija de referencia: los mocks nunca dependen de Date.now(). */
export const MOCK_NOW = Date.UTC(2026, 9, 1, 15, 0, 0);

// Montos en centavos. El costo siempre es menor al precio.
export const mockProducts: Product[] = [
  { id: 1, name: "Audífonos Bluetooth", sku: "AUD-001", category: "Electrónica", priceCents: 79900, costCents: 48000, stock: 120 },
  { id: 2, name: "Cargador USB-C 65W", sku: "CAR-002", category: "Electrónica", priceCents: 54900, costCents: 29000, stock: 200 },
  { id: 3, name: "Mouse Inalámbrico", sku: "MOU-003", category: "Computación", priceCents: 34900, costCents: 18000, stock: 150 },
  { id: 4, name: "Teclado Mecánico", sku: "TEC-004", category: "Computación", priceCents: 129900, costCents: 78000, stock: 80 },
  { id: 5, name: "Mochila para Laptop", sku: "MOC-009", category: "Accesorios", priceCents: 59900, costCents: 28000, stock: 180 },
  { id: 6, name: "Lámpara LED de Escritorio", sku: "LAM-011", category: "Hogar", priceCents: 44900, costCents: 21000, stock: 130 },
  { id: 7, name: "Silla Ergonómica", sku: "SIL-014", category: "Muebles", priceCents: 399900, costCents: 250000, stock: 30 },
  { id: 8, name: "Power Bank 20000mAh", sku: "POW-019", category: "Electrónica", priceCents: 69900, costCents: 36000, stock: 160 },
];

const CUSTOMERS = [
  "Ana Torres", "Luis Hernández", "María García", "Carlos Ramírez", "Sofía Morales",
  "Jorge Castillo", "Valeria Núñez", "Diego Ortega", "Paola Jiménez", "Andrés Vargas",
];

// 40 pedidos cada 18 h hacia atrás. El id = 1 es el más reciente y queda en "pending".
export const mockOrders: Order[] = Array.from({ length: 40 }, (_, i) => {
  const product = mockProducts[(i * 5) % mockProducts.length];
  const quantity = 1 + ((i * 3) % 4);
  const createdAt = new Date(MOCK_NOW - i * 18 * HOUR).toISOString();
  return {
    id: i + 1,
    customer: CUSTOMERS[(i * 7) % CUSTOMERS.length],
    productId: product.id,
    quantity,
    totalCents: product.priceCents * quantity,
    costCents: product.costCents * quantity,
    status: ORDER_STATUSES[i % ORDER_STATUSES.length],
    createdAt,
    updatedAt: createdAt,
  };
});

export function byNewest(a: Order, b: Order): number {
  return b.createdAt.localeCompare(a.createdAt) || b.id - a.id;
}

/** Misma forma que GET /api/analytics, calculada con las métricas compartidas. */
export function buildAnalytics(
  orders: Order[],
  products: Product[],
  { page = 1, limit = 50 }: PaginationQuery = {},
): Analytics {
  const totalSalesCents = orders.reduce((acc, o) => acc + o.totalCents, 0);
  const totalCostCents = orders.reduce((acc, o) => acc + o.costCents, 0);

  const since = new Date(MOCK_NOW - 30 * DAY).toISOString();
  const byDay = new Map<string, number>();
  for (const o of orders) {
    if (o.createdAt < since) continue;
    const day = o.createdAt.slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + o.totalCents);
  }

  const names = new Map(products.map((p) => [p.id, p.name]));
  const pagination = buildPagination(orders.length, page, limit);

  return {
    kpis: {
      totalSalesCents,
      ordersCount: orders.length,
      averageTicketCents: averageTicket(orders.map((o) => o.totalCents)),
      grossMarginPct: grossMargin(totalSalesCents, totalCostCents),
    },
    salesByDay: [...byDay]
      .map(([date, totalCents]) => ({ date, totalCents }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    data: [...orders]
      .sort(byNewest)
      .slice(pagination.offset, pagination.offset + limit)
      .map((o) => ({ ...o, productName: names.get(o.productId) ?? "" })),
    pagination,
    elapsedMs: 0,
  };
}

export const mockAnalytics: Analytics = buildAnalytics(mockOrders, mockProducts);

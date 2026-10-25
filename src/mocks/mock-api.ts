import { ApiError, type ApiClient } from "@/lib/api";
import { buildPagination, filterOrders } from "@/lib/metrics";
import { bulkUpdateSchema, orderCreateSchema, orderStatusUpdateSchema } from "@/lib/schemas";
import type { Order, OrderListItem, Product } from "@/lib/types";
import { buildAnalytics, byNewest, mockOrders, mockProducts } from "./data";

// Copia en memoria: las mutaciones no alteran los datos base
let orders: Order[] = structuredClone(mockOrders);
let products: Product[] = structuredClone(mockProducts);

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

function withProductName(o: Order): OrderListItem {
  return { ...o, productName: products.find((p) => p.id === o.productId)?.name ?? null };
}

function findOrder(id: number): Order {
  const order = orders.find((o) => o.id === id);
  if (!order) throw new ApiError(404, "Pedido no encontrado");
  return order;
}

function assertUniqueSku(sku: string | undefined, exceptId?: number) {
  if (sku && products.some((p) => p.sku === sku && p.id !== exceptId)) {
    throw new ApiError(409, "No se pudo guardar (¿SKU repetido?)");
  }
}

/** Mismas firmas que `api`, contra datos en memoria. */
export const mockApi: ApiClient = {
  async getAnalytics(query = {}) {
    await delay();
    return buildAnalytics(orders, products, query);
  },

  async getOrders(filters = {}) {
    await delay();
    const { page = 1, limit = 20 } = filters;
    const filtered = filterOrders(orders, filters).sort(byNewest);
    const pagination = buildPagination(filtered.length, page, limit);
    return {
      data: filtered.slice(pagination.offset, pagination.offset + limit).map(withProductName),
      pagination,
    };
  },

  async createOrder(input) {
    await delay();
    const parsed = orderCreateSchema.safeParse(input);
    if (!parsed.success) throw new ApiError(400, "Datos inválidos", parsed.error.issues);
    const product = products.find((p) => p.id === parsed.data.productId);
    if (!product) throw new ApiError(404, "Producto no encontrado");

    const now = new Date().toISOString();
    const created: Order = {
      id: Math.max(0, ...orders.map((o) => o.id)) + 1,
      customer: parsed.data.customer,
      productId: product.id,
      quantity: parsed.data.quantity,
      totalCents: product.priceCents * parsed.data.quantity,
      costCents: product.costCents * parsed.data.quantity,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };
    orders = [created, ...orders];
    return created;
  },

  async updateOrderStatus(id, input) {
    await delay();
    const parsed = orderStatusUpdateSchema.safeParse(input);
    if (!parsed.success) throw new ApiError(400, "Datos inválidos", parsed.error.issues);
    const updated = { ...findOrder(id), status: parsed.data.status, updatedAt: new Date().toISOString() };
    orders = orders.map((o) => (o.id === id ? updated : o));
    return updated;
  },

  async bulkUpdateOrders(input) {
    await delay();
    const parsed = bulkUpdateSchema.safeParse(input);
    if (!parsed.success) throw new ApiError(400, "Datos inválidos", parsed.error.issues);
    const ids = new Set(parsed.data.ids);
    const now = new Date().toISOString();
    let updated = 0;
    orders = orders.map((o) => {
      if (!ids.has(o.id)) return o;
      updated++;
      return { ...o, status: parsed.data.status, updatedAt: now };
    });
    return { updated };
  },

  async getProducts() {
    await delay();
    return [...products].sort((a, b) => a.name.localeCompare(b.name));
  },

  async createProduct(input) {
    await delay();
    assertUniqueSku(input.sku);
    const created: Product = {
      ...input,
      id: Math.max(0, ...products.map((p) => p.id)) + 1,
      stock: input.stock ?? 0,
    };
    products = [...products, created];
    return created;
  },

  async updateProduct(id, input) {
    await delay();
    const current = products.find((p) => p.id === id);
    if (!current) throw new ApiError(404, "Producto no encontrado");
    assertUniqueSku(input.sku, id);
    const updated = { ...current, ...input };
    products = products.map((p) => (p.id === id ? updated : p));
    return updated;
  },

  async deleteProduct(id) {
    await delay();
    if (!products.some((p) => p.id === id)) throw new ApiError(404, "Producto no encontrado");
    if (orders.some((o) => o.productId === id)) {
      throw new ApiError(409, "El producto tiene pedidos asociados");
    }
    products = products.filter((p) => p.id !== id);
    return { deleted: true };
  },
};

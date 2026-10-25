import type { z } from "zod";
import type {
  Analytics,
  BulkUpdateInput,
  BulkUpdateResult,
  DeleteProductResult,
  Order,
  OrderCreateInput,
  OrderFilters,
  OrderListItem,
  OrderStatusUpdate,
  Paginated,
  PaginationQuery,
  Product,
  ProductInput,
  ProductUpdate,
} from "@/lib/types";

export type ApiIssue = z.core.$ZodIssue;

/** Error con la forma del contrato: { error, issues } */
export class ApiError extends Error {
  readonly status: number;
  readonly error: string;
  readonly issues?: ApiIssue[];

  constructor(status: number, error: string, issues?: ApiIssue[]) {
    super(error);
    this.name = "ApiError";
    this.status = status;
    this.error = error;
    this.issues = issues;
  }
}

function isErrorBody(body: unknown): body is { error: string; issues?: ApiIssue[] } {
  return (
    typeof body === "object" &&
    body !== null &&
    typeof (body as { error?: unknown }).error === "string"
  );
}

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let res: Response;
  try {
    res = await fetch(url, { ...init, headers });
  } catch {
    // status 0: no hubo respuesta del servidor
    throw new ApiError(0, "No se pudo conectar con el servidor");
  }

  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    if (isErrorBody(body)) throw new ApiError(res.status, body.error, body.issues);
    throw new ApiError(res.status, `Error ${res.status}`);
  }
  return body as T;
}

/** Mensaje legible para toasts. */
export function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.error;
  return fallback;
}

/** Omite valores vacíos y el filtro "all", que el servidor no conoce. */
function toQuery(params: Record<string, string | number | undefined>): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "" || value === "all") continue;
    sp.set(key, String(value));
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

const json = (method: string, body: unknown): RequestInit => ({
  method,
  body: JSON.stringify(body),
});

export const api = {
  getAnalytics: (query: PaginationQuery = {}) =>
    fetchJson<Analytics>(`/api/analytics${toQuery(query)}`),

  getOrders: (filters: OrderFilters = {}) =>
    fetchJson<Paginated<OrderListItem>>(`/api/orders${toQuery(filters)}`),
  createOrder: (input: OrderCreateInput) =>
    fetchJson<Order>("/api/orders", json("POST", input)),
  updateOrderStatus: (id: number, input: OrderStatusUpdate) =>
    fetchJson<Order>(`/api/orders/${id}/status`, json("PATCH", input)),
  bulkUpdateOrders: (input: BulkUpdateInput) =>
    fetchJson<BulkUpdateResult>("/api/orders/bulk", json("PATCH", input)),

  getProducts: () => fetchJson<Product[]>("/api/products"),
  createProduct: (input: ProductInput) =>
    fetchJson<Product>("/api/products", json("POST", input)),
  updateProduct: (id: number, input: ProductUpdate) =>
    fetchJson<Product>(`/api/products/${id}`, json("PATCH", input)),
  deleteProduct: (id: number) =>
    fetchJson<DeleteProductResult>(`/api/products/${id}`, { method: "DELETE" }),
};

export type ApiClient = typeof api;

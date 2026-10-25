import type { z } from "zod";
import type { orders, products } from "@/db/schema";
import type { buildPagination } from "@/lib/metrics";
import type {
  bulkUpdateSchema,
  orderCreateSchema,
  orderStatusUpdateSchema,
  paginationQuerySchema,
} from "@/lib/schemas";
import type { getAnalytics } from "@/lib/services/analytics";

export type { OrderStatus } from "@/lib/schemas";
import type { OrderStatus } from "@/lib/schemas";

/** Las fechas viajan por JSON como string ISO. */
type Serialized<T> = { [K in keyof T]: T[K] extends Date ? string : T[K] };

// Entradas: derivadas de los schemas zod compartidos
export type OrderCreateInput = z.infer<typeof orderCreateSchema>;
export type OrderStatusUpdate = z.infer<typeof orderStatusUpdateSchema>;
export type BulkUpdateInput = z.infer<typeof bulkUpdateSchema>;
export type PaginationQuery = Partial<z.infer<typeof paginationQuerySchema>>;

export type OrderFilters = PaginationQuery & {
  status?: OrderStatus | "all";
  q?: string;
};

// Entidades: derivadas del esquema de Drizzle
export type Order = Serialized<typeof orders.$inferSelect>;
export type OrderListItem = Order & { productName: string | null };

export type Product = typeof products.$inferSelect;
export type ProductInput = Omit<typeof products.$inferInsert, "id">;
export type ProductUpdate = Partial<ProductInput>;

// Respuestas
export type Pagination = Omit<ReturnType<typeof buildPagination>, "offset"> & {
  offset?: number;
};

export type Paginated<T> = { data: T[]; pagination: Pagination };

type AnalyticsResult = Awaited<ReturnType<typeof getAnalytics>>;

export type Analytics = Omit<AnalyticsResult, "data"> & {
  data: Serialized<AnalyticsResult["data"][number]>[];
  elapsedMs: number;
};

export type BulkUpdateResult = { updated: number };
export type DeleteProductResult = { deleted: true };

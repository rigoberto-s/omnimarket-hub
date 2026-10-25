import { z } from "zod";

export const ORDER_STATUSES = [
  "pending",
  "preparing",
  "shipped",
  "delivered",
] as const;

export const orderStatusSchema = z.enum(ORDER_STATUSES);

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export const orderCreateSchema = z.object({
  customer: z.string().trim().min(2).max(80),
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(999),
});

export const orderStatusUpdateSchema = z.object({ status: orderStatusSchema });

export const bulkUpdateSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1).max(200),
  status: orderStatusSchema,
});

export type OrderStatus = z.infer<typeof orderStatusSchema>;

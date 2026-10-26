import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import type {
  BulkUpdateInput,
  OrderCreateInput,
  OrderFilters,
  OrderListItem,
  OrderStatus,
  Paginated,
} from "@/lib/types";
import { client } from "./api-client";
import { analyticsKeys } from "./use-analytics";

export const orderKeys = {
  all: ["orders"] as const,
  list: (filters: OrderFilters) => ["orders", filters] as const,
};

// Un cambio de pedidos también altera los KPIs
function invalidateOrders(qc: QueryClient) {
  return Promise.all([
    qc.invalidateQueries({ queryKey: orderKeys.all }),
    qc.invalidateQueries({ queryKey: analyticsKeys.all }),
  ]);
}

export function useOrders(filters: OrderFilters = {}) {
  return useQuery({
    queryKey: orderKeys.list(filters),
    queryFn: () => client.getOrders(filters),
    placeholderData: keepPreviousData,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: OrderCreateInput) => client.createOrder(input),
    onSuccess: (order) => toast.success(`Pedido #${order.id} creado`),
    onError: (err) => toast.error(getErrorMessage(err, "No se pudo crear el pedido")),
    onSettled: () => invalidateOrders(qc),
  });
}

/** Optimista: mueve el pedido en todas las listas en caché y revierte si falla. */
export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
      client.updateOrderStatus(id, { status }),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: orderKeys.all });
      const previous = qc.getQueriesData<Paginated<OrderListItem>>({ queryKey: orderKeys.all });
      qc.setQueriesData<Paginated<OrderListItem>>({ queryKey: orderKeys.all }, (old) =>
        old && { ...old, data: old.data.map((o) => (o.id === id ? { ...o, status } : o)) },
      );
      return { previous };
    },
    onError: (err, _vars, ctx) => {
      ctx?.previous.forEach(([key, data]) => qc.setQueryData(key, data));
      toast.error("No se pudo mover el pedido", { description: "Se revirtió el cambio." });
    },
    onSuccess: (order) => {
      const labels: Record<OrderStatus, string> = {
        pending: "Pendiente",
        preparing: "Preparando",
        shipped: "Enviado",
        delivered: "Entregado",
      };
      toast.success("Pedido actualizado", {
        description: `El pedido #${order.id} ahora está en ${labels[order.status]}.`,
      });
    },
    onSettled: () => invalidateOrders(qc),
  });
}

/** Optimista: cambia el estado de todos los pedidos seleccionados y revierte si falla. */
export function useBulkUpdateOrders() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: BulkUpdateInput) => client.bulkUpdateOrders(input),
    onMutate: async ({ ids, status }) => {
      await qc.cancelQueries({ queryKey: orderKeys.all });
      const previous = qc.getQueriesData<Paginated<OrderListItem>>({ queryKey: orderKeys.all });
      const selected = new Set(ids);
      qc.setQueriesData<Paginated<OrderListItem>>({ queryKey: orderKeys.all }, (old) =>
        old && { ...old, data: old.data.map((o) => (selected.has(o.id) ? { ...o, status } : o)) },
      );
      return { previous };
    },
    onError: (err, _vars, ctx) => {
      ctx?.previous.forEach(([key, data]) => qc.setQueryData(key, data));
      toast.error(getErrorMessage(err, "No se pudieron actualizar los pedidos"), {
        description: "Se revirtió el cambio.",
      });
    },
    onSuccess: ({ updated }) => toast.success(`${updated} pedidos actualizados`),
    onSettled: () => invalidateOrders(qc),
  });
}

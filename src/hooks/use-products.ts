import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError, getErrorMessage } from "@/lib/api";
import type { ProductInput, ProductUpdate } from "@/lib/types";
import { client } from "./api-client";
import { analyticsKeys } from "./use-analytics";
import { orderKeys } from "./use-orders";

export const productKeys = {
  all: ["products"] as const,
};

export function useProducts() {
  return useQuery({
    queryKey: productKeys.all,
    queryFn: () => client.getProducts(),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductInput) => client.createProduct(input),
    onSuccess: (product) => toast.success(`Producto "${product.name}" creado`),
    onError: (err) => toast.error(getErrorMessage(err, "No se pudo crear el producto")),
    onSettled: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ProductUpdate }) =>
      client.updateProduct(id, input),
    onSuccess: (product) => toast.success(`Producto "${product.name}" actualizado`),
    onError: (err) => toast.error(getErrorMessage(err, "No se pudo editar el producto")),
    // El nombre del producto aparece en pedidos y analítica
    onSettled: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: productKeys.all }),
        qc.invalidateQueries({ queryKey: orderKeys.all }),
        qc.invalidateQueries({ queryKey: analyticsKeys.all }),
      ]),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => client.deleteProduct(id),
    onSuccess: () => toast.success("Producto eliminado"),
    onError: (err) => {
      if (err instanceof ApiError && err.status === 409) {
        toast.error("No se pudo eliminar el producto", { description: "Tiene pedidos asociados. Elimina o reasigna esos pedidos primero." });
        return;
      }
      toast.error(getErrorMessage(err, "No se pudo eliminar el producto"));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
}

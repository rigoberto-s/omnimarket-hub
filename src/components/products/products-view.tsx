"use client";

import { useState } from "react";
import { PackageIcon, PlusIcon } from "lucide-react";
import { ErrorCard } from "@/components/dashboard/error-card";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/use-products";
import { getErrorMessage } from "@/lib/api";
import type { Product } from "@/lib/types";
import { DeleteProductDialog } from "./delete-product-dialog";
import { ProductFormDialog } from "./product-form-dialog";
import { ProductsTable } from "./products-table";

const PRIMARY = "rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700";

export function ProductsView() {
  const { data, isPending, isError, error, refetch } = useProducts();

  // El producto se conserva al cerrar para que el texto no cambie durante la animación
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Product | null>(null);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setFormOpen(true);
  }

  function openDelete(product: Product) {
    setDeleting(product);
    setDeleteOpen(true);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Productos</h1>
          <p className="text-sm text-zinc-600">Catálogo con precios, costos y existencias.</p>
        </div>
        <Button onClick={openCreate} className={`h-10 px-4 ${PRIMARY}`}>
          <PlusIcon aria-hidden="true" />
          Nuevo producto
        </Button>
      </div>

      {isError ? (
        <ErrorCard
          message={getErrorMessage(error, "No se pudieron cargar los productos.")}
          onRetry={() => refetch()}
        />
      ) : data?.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-300 px-6 py-10 text-center">
          <PackageIcon className="size-8 text-zinc-400" aria-hidden="true" />
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold">Aún no hay productos</h2>
            <p className="text-sm text-zinc-600">Cuando se registre el primero aparecerá aquí.</p>
          </div>
          <Button onClick={openCreate} className={`h-9 px-3.5 ${PRIMARY}`}>
            Nuevo producto
          </Button>
        </div>
      ) : (
        <ProductsTable
          rows={data}
          isLoading={isPending}
          onEdit={openEdit}
          onDelete={openDelete}
        />
      )}

      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editing} />
      <DeleteProductDialog open={deleteOpen} onOpenChange={setDeleteOpen} product={deleting} />
    </div>
  );
}

import { PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

const SKELETON_ROWS = 10;

const TH = "px-5 py-2.5 text-left text-xs font-medium text-zinc-600";
const TD = "px-5";

type ProductsTableProps = {
  rows: Product[] | undefined;
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

export function ProductsTable({ rows, isLoading, onEdit, onDelete }: ProductsTableProps) {
  return (
    <section
      aria-busy={isLoading}
      className="overflow-hidden rounded-xl border border-zinc-200 bg-white"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-215 border-collapse">
          <caption className="sr-only">Productos</caption>
          <thead className="bg-zinc-50">
            <tr>
              <th scope="col" className={TH}>Nombre</th>
              <th scope="col" className={cn(TH, "box-content w-24")}>SKU</th>
              <th scope="col" className={cn(TH, "box-content w-30")}>Categoría</th>
              <th scope="col" className={cn(TH, "box-content w-28 text-right")}>Precio</th>
              <th scope="col" className={cn(TH, "box-content w-28 text-right")}>Costo</th>
              <th scope="col" className={cn(TH, "box-content w-27 text-right")}>Existencias</th>
              <th scope="col" className={cn(TH, "box-content w-22 text-right")}>Acciones</th>
            </tr>
          </thead>

          <tbody className="text-sm">
            {isLoading &&
              Array.from({ length: SKELETON_ROWS }, (_, i) => (
                <tr key={i} className="h-14 border-b border-zinc-100">
                  <td className={TD}><Skeleton className="h-4 w-44" /></td>
                  <td className={TD}><Skeleton className="h-4 w-16" /></td>
                  <td className={TD}><Skeleton className="h-4 w-20" /></td>
                  <td className={TD}><Skeleton className="ml-auto h-4 w-16" /></td>
                  <td className={TD}><Skeleton className="ml-auto h-4 w-16" /></td>
                  <td className={TD}><Skeleton className="ml-auto h-4 w-8" /></td>
                  <td className={TD}><Skeleton className="ml-auto h-8 w-18" /></td>
                </tr>
              ))}

            {rows?.map((product) => (
              <tr key={product.id} className="h-14 border-b border-zinc-100">
                <td className={cn(TD, "font-medium")}>{product.name}</td>
                <td className={cn(TD, "font-mono text-[13px] text-zinc-600")}>{product.sku}</td>
                <td className={cn(TD, "text-zinc-700")}>{product.category}</td>
                <td className={cn(TD, "text-right tabular-nums")}>
                  {formatCurrency(product.priceCents)}
                </td>
                <td className={cn(TD, "text-right text-zinc-600 tabular-nums")}>
                  {formatCurrency(product.costCents)}
                </td>
                <td className={cn(TD, "text-right tabular-nums")}>{product.stock}</td>
                <td className={TD}>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Editar producto"
                      onClick={() => onEdit(product)}
                      className="rounded-lg text-zinc-700"
                    >
                      <PencilIcon aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Eliminar producto"
                      onClick={() => onDelete(product)}
                      className="rounded-lg text-red-700 hover:bg-red-50 hover:text-red-800"
                    >
                      <Trash2Icon aria-hidden="true" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3">
        {rows ? (
          <p className="text-sm text-zinc-600">{`${rows.length} de ${rows.length} productos`}</p>
        ) : (
          <Skeleton className="h-4 w-32" />
        )}
      </div>
    </section>
  );
}

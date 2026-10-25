"use client";

import { useRef, useState } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteProduct } from "@/hooks/use-products";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { createFocusReturn, DIALOG_OVERLAY, DIALOG_PANEL } from "./dialog-panel";

type DeleteProductDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
};

export function DeleteProductDialog({ open, onOpenChange, product }: DeleteProductDialogProps) {
  const [focusReturn] = useState(createFocusReturn);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const deleteProduct = useDeleteProduct();

  function confirm() {
    if (!product) return;
    // Bien o mal, se cierra: el hook muestra el toast que corresponda
    deleteProduct.mutate(product.id, { onSettled: () => onOpenChange(false) });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className={DIALOG_OVERLAY} />
        <DialogPrimitive.Content
          role="alertdialog"
          className={cn(DIALOG_PANEL, "max-w-110 gap-4")}
          onOpenAutoFocus={(e) => {
            focusReturn.capture();
            // Foco inicial en la opción segura
            e.preventDefault();
            cancelRef.current?.focus();
          }}
          onCloseAutoFocus={focusReturn.restore}
          // Una confirmación no se descarta con un clic fuera
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogTitle className="text-lg leading-tight font-semibold">
            ¿Eliminar {product?.name}?
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-600">
            Esta acción no se puede deshacer. Si el producto tiene pedidos asociados, no se podrá
            eliminar.
          </DialogDescription>

          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button
                ref={cancelRef}
                type="button"
                variant="outline"
                className="h-10 rounded-lg border-zinc-300 bg-white px-4 text-sm font-medium"
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={confirm}
              disabled={deleteProduct.isPending}
              className="h-10 rounded-lg bg-red-700 px-4 text-sm font-medium text-white hover:bg-red-800"
            >
              {deleteProduct.isPending ? "Eliminando…" : "Eliminar"}
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

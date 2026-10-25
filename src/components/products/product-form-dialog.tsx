"use client";

import { useId, useState } from "react";
import { XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { NativeSelect } from "@/components/orders/native-select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCreateProduct, useUpdateProduct } from "@/hooks/use-products";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { createFocusReturn, DIALOG_OVERLAY, DIALOG_PANEL } from "./dialog-panel";
import {
  PRODUCT_CATEGORIES,
  productFormSchema,
  type ProductFormField,
  type ProductFormValues,
} from "./product-form-schema";

type FormErrors = Partial<Record<ProductFormField, string>>;

const FIELDS: ProductFormField[] = ["name", "sku", "category", "price", "cost", "stock"];
const LABEL = "text-sm font-medium";
const INPUT =
  "h-10 rounded-lg border-zinc-300 bg-white px-3 aria-invalid:border-red-700 aria-invalid:ring-red-700/20";

function initialValues(product: Product | null): ProductFormValues {
  if (!product) return { name: "", sku: "", category: "", price: "", cost: "", stock: "0" };
  return {
    name: product.name,
    sku: product.sku,
    category: product.category,
    // Texto del input en pesos con 2 decimales, no un importe formateado
    price: (product.priceCents / 100).toFixed(2),
    cost: (product.costCents / 100).toFixed(2),
    stock: String(product.stock),
  };
}

function validate(values: ProductFormValues) {
  const result = productFormSchema.safeParse(values);
  const errors: FormErrors = {};
  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0] as ProductFormField;
      errors[field] ??= issue.message;
    }
  }
  return { result, errors };
}

type ProductFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = crear; un producto = editar */
  product: Product | null;
};

export function ProductFormDialog({ open, onOpenChange, product }: ProductFormDialogProps) {
  const [focusReturn] = useState(createFocusReturn);
  const isEdit = product !== null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className={DIALOG_OVERLAY} />
        {/* Content de Radix: Escape, foco atrapado; el foco vuelve al botón que lo abrió */}
        <DialogPrimitive.Content
          className={cn(DIALOG_PANEL, "max-w-130 gap-4.5")}
          onOpenAutoFocus={focusReturn.capture}
          onCloseAutoFocus={focusReturn.restore}
        >
          <div className="flex flex-col gap-1 pr-8">
            <DialogTitle className="text-lg leading-tight font-semibold">
              {isEdit ? "Editar producto" : "Nuevo producto"}
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-600">
              Precio y costo se capturan en pesos.
            </DialogDescription>
          </div>

          <DialogClose asChild>
            <Button variant="ghost" size="icon" aria-label="Cerrar" className="absolute top-4 right-4">
              <XIcon aria-hidden="true" />
            </Button>
          </DialogClose>

          {/* Se monta al abrir: el formulario empieza limpio cada vez */}
          <ProductForm
            key={product?.id ?? "new"}
            product={product}
            onDone={() => onOpenChange(false)}
          />
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

function ProductForm({ product, onDone }: { product: Product | null; onDone: () => void }) {
  const [values, setValues] = useState(() => initialValues(product));
  const [errors, setErrors] = useState<FormErrors>({});
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const id = useId();
  const isEdit = product !== null;
  const isSaving = createProduct.isPending || updateProduct.isPending;

  const fieldId = (field: ProductFormField) => `${id}-${field}`;
  const errorId = (field: ProductFormField) => `${id}-${field}-error`;

  // Al editar se conserva la categoría actual aunque no esté en la lista del diseño
  const categories: string[] =
    product && !PRODUCT_CATEGORIES.some((c) => c === product.category)
      ? [...PRODUCT_CATEGORIES, product.category]
      : [...PRODUCT_CATEGORIES];

  function update(field: ProductFormField, value: string) {
    const next = { ...values, [field]: value };
    setValues(next);
    if (errors[field]) setErrors((e) => ({ ...e, [field]: validate(next).errors[field] }));
  }

  function handleBlur(field: ProductFormField) {
    setErrors((e) => ({ ...e, [field]: validate(values).errors[field] }));
  }

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const { result, errors: nextErrors } = validate(values);
    setErrors(nextErrors);
    if (!result.success) {
      const first = FIELDS.find((f) => nextErrors[f]);
      if (first) document.getElementById(fieldId(first))?.focus();
      return;
    }
    if (product) updateProduct.mutate({ id: product.id, input: result.data }, { onSuccess: onDone });
    else createProduct.mutate(result.data, { onSuccess: onDone });
  }

  const fieldProps = (field: ProductFormField) => ({
    id: fieldId(field),
    value: values[field],
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? errorId(field) : undefined,
    onBlur: () => handleBlur(field),
  });

  const field = (name: ProductFormField, label: string, control: React.ReactNode) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId(name)} className={LABEL}>
        {label}
      </label>
      {control}
      {errors[name] && (
        <p id={errorId(name)} className="text-xs text-red-700">
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4.5">
      {field(
        "name",
        "Nombre",
        <Input
          {...fieldProps("name")}
          type="text"
          autoComplete="off"
          onChange={(e) => update("name", e.target.value)}
          className={INPUT}
        />,
      )}

      <div className="grid grid-cols-2 gap-4">
        {field(
          "sku",
          "SKU",
          <Input
            {...fieldProps("sku")}
            type="text"
            autoComplete="off"
            onChange={(e) => update("sku", e.target.value)}
            className={cn(INPUT, "font-mono")}
          />,
        )}
        {field(
          "category",
          "Categoría",
          <NativeSelect
            {...fieldProps("category")}
            onChange={(e) => update("category", e.target.value)}
          >
            <option value="">Selecciona una categoría…</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </NativeSelect>,
        )}
        {field(
          "price",
          "Precio (MXN)",
          <Input
            {...fieldProps("price")}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.00"
            onChange={(e) => update("price", e.target.value)}
            className={cn(INPUT, "tabular-nums")}
          />,
        )}
        {field(
          "cost",
          "Costo (MXN)",
          <Input
            {...fieldProps("cost")}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.00"
            onChange={(e) => update("cost", e.target.value)}
            className={cn(INPUT, "tabular-nums")}
          />,
        )}
        {field(
          "stock",
          "Existencias",
          <Input
            {...fieldProps("stock")}
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            onChange={(e) => update("stock", e.target.value)}
            className={cn(INPUT, "tabular-nums")}
          />,
        )}
      </div>

      <div className="flex justify-end gap-2">
        <DialogClose asChild>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-lg border-zinc-300 bg-white px-4 text-sm font-medium"
          >
            Cancelar
          </Button>
        </DialogClose>
        <Button
          type="submit"
          disabled={isSaving}
          className="h-10 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {isEdit
            ? isSaving ? "Guardando…" : "Guardar cambios"
            : isSaving ? "Creando…" : "Crear producto"}
        </Button>
      </div>
    </form>
  );
}

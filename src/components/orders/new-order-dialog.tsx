"use client";

import { useId, useState } from "react";
import { PlusIcon, XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCreateOrder } from "@/hooks/use-orders";
import { useProducts } from "@/hooks/use-products";
import { formatCurrency } from "@/lib/format";
import { orderCreateSchema } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { NativeSelect } from "./native-select";

type Field = "customer" | "productId" | "quantity";
type FormValues = { customer: string; productId: string; quantity: string };
type FormErrors = Partial<Record<Field, string>>;

const EMPTY_FORM: FormValues = { customer: "", productId: "", quantity: "1" };

const MESSAGES: Record<Field, string> = {
  customer: "El cliente debe tener al menos 2 caracteres.",
  productId: "Selecciona un producto.",
  quantity: "La cantidad debe ser de 1 a 999.",
};

const FIELDS: Field[] = ["customer", "productId", "quantity"];
const LABEL = "text-sm font-medium";
const INPUT = "h-10 rounded-lg border-zinc-300 bg-white aria-invalid:border-red-700 aria-invalid:ring-red-700/20";

/** Convierte los valores del formulario (texto) a lo que espera orderCreateSchema (números). */
function validate(values: FormValues) {
  const result = orderCreateSchema.safeParse({
    customer: values.customer,
    productId: values.productId === "" ? 0 : Number(values.productId),
    quantity: values.quantity === "" ? 0 : Number(values.quantity),
  });
  const errors: FormErrors = {};
  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0] as Field;
      errors[field] = MESSAGES[field];
    }
  }
  return { result, errors };
}

export function NewOrderDialog() {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const createOrder = useCreateOrder();
  const products = useProducts();
  const id = useId();
  const fieldId = (field: Field) => `${id}-${field}`;
  const errorId = (field: Field) => `${id}-${field}-error`;

  function reset() {
    setValues(EMPTY_FORM);
    setErrors({});
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    setOpen(next);
  }

  function update(field: Field, value: string) {
    const next = { ...values, [field]: value };
    setValues(next);
    // Si el campo ya mostraba error, se revalida al escribir
    if (errors[field]) setErrors((e) => ({ ...e, [field]: validate(next).errors[field] }));
  }

  function handleBlur(field: Field) {
    setErrors((e) => ({ ...e, [field]: validate(values).errors[field] }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { result, errors: nextErrors } = validate(values);
    setErrors(nextErrors);
    if (!result.success) {
      const first = FIELDS.find((f) => nextErrors[f]);
      if (first) document.getElementById(fieldId(first))?.focus();
      return;
    }
    createOrder.mutate(result.data, {
      onSuccess: () => {
        reset();
        setOpen(false);
      },
    });
  }

  const fieldProps = (field: Field) => ({
    id: fieldId(field),
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? errorId(field) : undefined,
    onBlur: () => handleBlur(field),
  });

  const fieldError = (field: Field) =>
    errors[field] && (
      <p id={errorId(field)} className="text-xs text-red-700">
        {errors[field]}
      </p>
    );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          data-testid="orders-new-button"
          className="h-10 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <PlusIcon aria-hidden="true" />
          Nuevo pedido
        </Button>
      </DialogTrigger>

      <DialogPortal>
        <DialogOverlay className="bg-zinc-900/55 supports-backdrop-filter:backdrop-blur-none" />
        {/* Content de Radix: Escape, foco atrapado y devolución del foco al botón */}
        <DialogPrimitive.Content
          className={cn(
            "fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-120 -translate-x-1/2 -translate-y-1/2 flex-col gap-5",
            "rounded-xl border border-zinc-200 bg-white p-6 shadow-xl outline-none",
            "duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
            "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          )}
        >
          <div className="flex flex-col gap-1 pr-8">
            <DialogTitle className="text-lg leading-tight font-semibold">Nuevo pedido</DialogTitle>
            <DialogDescription className="text-sm text-zinc-600">
              El total y el costo se calculan en el servidor.
            </DialogDescription>
          </div>

          <DialogClose asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Cerrar" className="absolute top-4 right-4">
              <XIcon aria-hidden="true" />
            </Button>
          </DialogClose>

          <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={fieldId("customer")} className={LABEL}>
                Cliente
              </label>
              <Input
                {...fieldProps("customer")}
                data-testid="order-form-customer"
                type="text"
                autoComplete="off"
                maxLength={80}
                value={values.customer}
                onChange={(e) => update("customer", e.target.value)}
                className={INPUT}
              />
              {fieldError("customer")}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={fieldId("productId")} className={LABEL}>
                Producto
              </label>
              <NativeSelect
                {...fieldProps("productId")}
                data-testid="order-form-product"
                value={values.productId}
                disabled={products.isPending}
                onChange={(e) => update("productId", e.target.value)}
              >
                <option value="">Selecciona un producto…</option>
                {products.data?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {`${p.name} · ${formatCurrency(p.priceCents)}`}
                  </option>
                ))}
              </NativeSelect>
              {fieldError("productId")}
              {products.isError && (
                <p className="text-xs text-red-700">No se pudieron cargar los productos.</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={fieldId("quantity")} className={LABEL}>
                Cantidad
              </label>
              <Input
                {...fieldProps("quantity")}
                data-testid="order-form-quantity"
                type="number"
                inputMode="numeric"
                min={1}
                max={999}
                step={1}
                value={values.quantity}
                onChange={(e) => update("quantity", e.target.value)}
                className={INPUT}
              />
              {fieldError("quantity")}
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
                data-testid="order-form-submit"
                disabled={createOrder.isPending}
                className="h-10 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700"
              >
                {createOrder.isPending ? "Creando…" : "Crear pedido"}
              </Button>
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

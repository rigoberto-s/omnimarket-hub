import { z } from "zod";

export const PRODUCT_CATEGORIES = ["Electrónica", "Accesorios", "Hogar", "Oficina"] as const;

const MONEY_PATTERN = /^\d+(\.\d{1,2})?$/;
const STOCK_MESSAGE = "Las existencias deben ser un número entero de 0 o más.";

/** "1,249.50" (pesos, texto) -> 124950 (centavos). */
function moneyField(message: string) {
  return z
    .string()
    .transform((v) => v.replace(/[$,\s]/g, ""))
    .refine((v) => MONEY_PATTERN.test(v), message)
    .transform((v) => Math.round(Number(v) * 100))
    .pipe(z.number().int().min(0, message));
}

/**
 * Mismas reglas que productInputSchema de /api/products, pero sobre los textos del
 * formulario (precio y costo en pesos) y con mensajes en español.
 */
export const productFormSchema = z
  .object({
    name: z.string().trim().min(1, "Escribe el nombre del producto."),
    sku: z.string().trim().min(1, "Escribe el SKU."),
    category: z.string().min(1, "Selecciona una categoría."),
    price: moneyField("Escribe un precio válido (0 o más, hasta 2 decimales)."),
    cost: moneyField("Escribe un costo válido (0 o más, hasta 2 decimales)."),
    stock: z
      .string()
      .trim()
      .regex(/^\d+$/, STOCK_MESSAGE)
      .transform(Number)
      .pipe(z.number().int().min(0, STOCK_MESSAGE)),
  })
  .transform(({ price, cost, ...rest }) => ({ ...rest, priceCents: price, costCents: cost }));

export type ProductFormValues = z.input<typeof productFormSchema>;
export type ProductFormField = keyof ProductFormValues;

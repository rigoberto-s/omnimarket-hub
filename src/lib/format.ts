const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

const date = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeZone: "UTC",
});

/** 123456 -> "$1,234.56" */
export function formatCurrency(cents: number): string {
  return currency.format(cents / 100);
}

/** Zona horaria fija en UTC para que servidor y navegador coincidan (evita errores de hidratación). */
export function formatDate(iso: string): string {
  return date.format(new Date(iso));
}

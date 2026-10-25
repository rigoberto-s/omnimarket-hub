/** Ticket promedio en centavos. 0 si la lista está vacía. */
export function averageTicket(totalsCents: number[]): number {
  if (totalsCents.length === 0) return 0;
  const sum = totalsCents.reduce((acc, n) => acc + n, 0);
  return Math.round(sum / totalsCents.length);
}

/** Margen bruto en % (0-100, 1 decimal). 0 si no hay ingreso; negativo si el costo supera al ingreso. */
export function grossMargin(revenueCents: number, costCents: number): number {
  if (revenueCents === 0) return 0;
  const pct = ((revenueCents - costCents) / revenueCents) * 100;
  return Math.round(pct * 10) / 10;
}

export function buildPagination(total: number, page: number, limit: number) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return { page, limit, total, totalPages, offset: (page - 1) * limit };
}

export function filterOrders<T extends { status: string; customer: string }>(
  orders: T[],
  filters: { status?: string; q?: string },
): T[] {
  const q = filters.q?.trim().toLowerCase();
  return orders.filter((o) => {
    const statusOk =
      !filters.status || filters.status === "all" || o.status === filters.status;
    const textOk = !q || o.customer.toLowerCase().includes(q);
    return statusOk && textOk;
  });
}

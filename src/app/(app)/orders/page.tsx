import { NewOrderDialog } from "@/components/orders/new-order-dialog";
import { OrdersView } from "@/components/orders/orders-view";

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Pedidos</h1>
          <p className="text-sm text-zinc-600">Filtra, crea y actualiza el estado de los pedidos.</p>
        </div>
        <NewOrderDialog />
      </div>
      <OrdersView />
    </div>
  );
}

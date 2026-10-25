import { KanbanBoard } from "@/components/kanban/kanban-board";

export default function KanbanPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Kanban</h1>
        <p className="text-sm text-zinc-600">
          Arrastra una tarjeta a otra columna para cambiar el estado del pedido.
        </p>
      </div>
      <KanbanBoard />
    </div>
  );
}

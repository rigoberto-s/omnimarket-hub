/** Clases comunes de los paneles de diálogo de Productos (mismo patrón que Nuevo pedido). */
export const DIALOG_OVERLAY = "bg-zinc-900/55 supports-backdrop-filter:backdrop-blur-none";

export const DIALOG_PANEL =
  "fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col " +
  "rounded-xl border border-zinc-200 bg-white p-6 shadow-xl outline-none " +
  "duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 " +
  "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95";

/** Devuelve el foco al botón que abrió el diálogo (los diálogos se abren sin DialogTrigger). */
export function createFocusReturn() {
  let opener: HTMLElement | null = null;
  return {
    capture() {
      opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    },
    restore(event: Event) {
      if (opener?.isConnected) {
        event.preventDefault();
        opener.focus();
      }
    },
  };
}

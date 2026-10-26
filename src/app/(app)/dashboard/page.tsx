import { DashboardView } from "@/components/dashboard/dashboard-view";

const RING_RADII = [150, 115, 80, 45];

/** Banner de bienvenida (solo visual, sin datos): azul marino con resplandor y aros finos. */
function WelcomeBanner() {
  return (
    <section
      aria-labelledby="dashboard-banner-title"
      className="relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-950 to-indigo-950 px-6 py-7 text-white shadow-lg shadow-indigo-950/20 sm:px-8 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:animation-duration-500 motion-safe:fill-mode-both"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-radial-[at_10%_0%] from-indigo-500/35 via-blue-500/10 via-40% to-transparent to-70%"
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 320 320"
        fill="none"
        className="pointer-events-none absolute -right-28 -bottom-32 size-72 opacity-70 sm:top-1/2 sm:-right-16 sm:bottom-auto sm:-translate-y-1/2 sm:opacity-100"
      >
        {RING_RADII.map((r, i) => (
          <circle
            key={r}
            cx="160"
            cy="160"
            r={r}
            stroke="#FFFFFF"
            strokeOpacity={0.2 - i * 0.03}
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      <div className="relative z-10 flex max-w-md flex-col gap-1.5">
        <h2 id="dashboard-banner-title" className="text-2xl tracking-tight sm:text-[28px]">
          <span className="font-light">Resumen de </span>
          <span className="font-bold">tu negocio</span>
        </h2>
        <p className="text-sm text-slate-300 sm:text-base">
          Ventas, pedidos y margen de tu tienda, de un vistazo.
        </p>
      </div>
    </section>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-zinc-600">Resumen de ventas y pedidos recientes.</p>
      </div>
      <WelcomeBanner />
      <DashboardView />
    </div>
  );
}

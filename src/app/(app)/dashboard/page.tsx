import { DashboardView } from "@/components/dashboard/dashboard-view";

/** Banner de bienvenida (solo visual, sin datos). El texto va sobre la zona índigo/azul 600. */
function WelcomeBanner() {
  return (
    <section
      aria-labelledby="dashboard-banner-title"
      className="relative overflow-hidden rounded-2xl bg-linear-to-br from-indigo-600 to-blue-600 px-6 py-7 text-white shadow-lg shadow-blue-600/20 sm:px-8"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 320 200"
        fill="none"
        className="pointer-events-none absolute -right-20 -bottom-20 h-48 w-80 opacity-60 sm:top-1/2 sm:right-0 sm:bottom-auto sm:-translate-y-1/2 sm:opacity-100"
      >
        <circle cx="235" cy="70" r="80" fill="#38BDF8" fillOpacity="0.35" />
        <circle cx="295" cy="170" r="55" fill="#67E8F9" fillOpacity="0.25" />
        <circle cx="215" cy="105" r="95" stroke="#FFFFFF" strokeOpacity="0.2" strokeWidth="2" />
        {/* Mini gráfico abstracto, solo desde sm para no tapar el texto en móvil */}
        <g className="hidden sm:inline" fill="#FFFFFF" fillOpacity="0.5">
          <rect x="160" y="120" width="18" height="50" rx="5" />
          <rect x="188" y="95" width="18" height="75" rx="5" />
          <rect x="216" y="110" width="18" height="60" rx="5" />
          <rect x="244" y="75" width="18" height="95" rx="5" />
        </g>
      </svg>

      <div className="relative z-10 flex max-w-md flex-col gap-1.5">
        <h2 id="dashboard-banner-title" className="text-2xl font-semibold tracking-tight">
          Resumen de tu negocio
        </h2>
        <p className="text-sm text-indigo-50 sm:text-base">
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

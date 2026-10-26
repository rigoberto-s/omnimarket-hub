import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Formas decorativas del panel de marca (solo visual). */
function BrandShapes() {
  return (
    <>
      <svg
        aria-hidden="true"
        viewBox="0 0 400 400"
        fill="none"
        className="pointer-events-none absolute -top-20 -right-20 size-64 lg:-top-24 lg:-right-24 lg:size-112"
      >
        <circle cx="250" cy="150" r="140" fill="#38BDF8" fillOpacity="0.35" />
        <circle cx="110" cy="290" r="80" fill="#67E8F9" fillOpacity="0.25" />
        <circle cx="200" cy="200" r="185" stroke="#FFFFFF" strokeOpacity="0.2" strokeWidth="2" />
        <circle cx="200" cy="200" r="130" stroke="#FFFFFF" strokeOpacity="0.12" strokeWidth="2" />
      </svg>

      {/* Tarjeta abstracta con barras, solo en escritorio */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-12 bottom-36 hidden w-56 rounded-2xl border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-sm lg:block"
      >
        <div className="mb-4 h-2 w-20 rounded-full bg-white/40" />
        <div className="flex h-24 items-end gap-2.5">
          {["h-10", "h-16", "h-12", "h-24", "h-14", "h-20"].map((h) => (
            <div key={h} className={`flex-1 rounded-t-md bg-white/60 ${h}`} />
          ))}
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      {/* Panel de marca: franja compacta en móvil, columna completa en escritorio */}
      <section className="relative overflow-hidden bg-linear-to-br from-indigo-600 to-blue-600 px-6 py-8 text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <BrandShapes />
        <div className="relative z-10 flex items-center gap-3">
          <span
            className="flex size-10 items-center justify-center rounded-xl border border-white/30 bg-white/15"
            aria-hidden="true"
          >
            <span className="size-4 rounded-sm bg-white" />
          </span>
          <p className="text-2xl font-semibold tracking-tight">OmniMarket</p>
        </div>
        <p className="relative z-10 mt-3 hidden max-w-sm text-lg leading-relaxed text-indigo-50 lg:block">
          Ventas, pedidos, productos y Kanban en un solo panel.
        </p>
      </section>

      <div className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-12">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <div className="flex flex-col gap-1 text-center">
            <h1 className="bg-linear-to-r from-indigo-700 to-violet-700 bg-clip-text text-3xl font-semibold tracking-tight text-transparent">
              OmniMarket
            </h1>
            <p className="text-sm text-zinc-600">Inicia sesión para entrar al panel.</p>
          </div>

          <div className="flex flex-col gap-3">
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/dashboard" });
              }}
            >
              <Button
                className="h-10 w-full rounded-lg bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20 transition-shadow hover:from-indigo-700 hover:to-violet-700 hover:shadow-lg"
                type="submit"
              >
                Continuar con Google
              </Button>
            </form>
            <form
              action={async () => {
                "use server";
                await signIn("github", { redirectTo: "/dashboard" });
              }}
            >
              <Button
                className="h-10 w-full rounded-lg border-zinc-300 bg-white hover:bg-zinc-50"
                variant="outline"
                type="submit"
              >
                Continuar con GitHub
              </Button>
            </form>
          </div>

          {process.env.ENABLE_TEST_LOGIN === "true" && (
            <form
              className="flex flex-col gap-2 border-t border-zinc-200 pt-4"
              action={async (fd: FormData) => {
                "use server";
                await signIn("test-login", {
                  email: String(fd.get("email")),
                  redirectTo: "/dashboard",
                });
              }}
            >
              <Input
                name="email"
                type="email"
                aria-label="Correo de prueba"
                data-testid="test-login-email"
                defaultValue="test@omnimarket.dev"
                className="h-10 rounded-lg border-zinc-300"
              />
              <Button
                data-testid="test-login-submit"
                variant="secondary"
                type="submit"
                className="h-10 rounded-lg"
              >
                Acceso de prueba
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

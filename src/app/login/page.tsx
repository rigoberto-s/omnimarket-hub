import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const RING_RADII = [290, 230, 170, 110, 50];

/** Fondo del panel de marca: resplandor radial y círculos concéntricos finos (solo visual). */
function BrandBackdrop() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-radial-[at_15%_10%] from-indigo-500/40 via-blue-500/10 via-35% to-transparent to-65%"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-radial-[at_95%_95%] from-violet-500/25 to-transparent to-50%"
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 600 600"
        fill="none"
        className="pointer-events-none absolute -right-40 -bottom-48 size-112 lg:-right-56 lg:-bottom-56 lg:size-176"
      >
        {RING_RADII.map((r, i) => (
          <circle
            key={r}
            cx="300"
            cy="300"
            r={r}
            stroke="#FFFFFF"
            strokeOpacity={0.16 - i * 0.02}
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    </>
  );
}

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      {/* Panel de marca: franja compacta en móvil, columna completa en escritorio */}
      <section className="relative overflow-hidden bg-linear-to-br from-slate-950 to-indigo-950 px-6 py-8 text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <BrandBackdrop />
        <div className="relative z-10 flex items-center gap-3">
          <span
            className="flex size-10 items-center justify-center rounded-xl border border-white/20 bg-white/10"
            aria-hidden="true"
          >
            <span className="size-4 rounded-sm bg-white" />
          </span>
          <p className="text-2xl font-semibold tracking-tight">OmniMarket</p>
        </div>

        <div className="relative z-10 mt-5 flex flex-col gap-5 lg:mt-0">
          <p className="hidden w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[13px] font-medium text-slate-200 lg:inline-flex">
            <span className="size-2 rounded-full bg-emerald-400" aria-hidden="true" />
            Panel de operaciones
          </p>
          <p className="max-w-md text-2xl leading-tight tracking-tight lg:text-5xl">
            <span className="font-light">
              Tu tienda, <br />
              en un{" "}
            </span>
            <span className="font-bold">solo panel</span>
          </p>
        </div>
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

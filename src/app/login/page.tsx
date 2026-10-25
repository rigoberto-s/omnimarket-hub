import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-xl border bg-background p-6 shadow-sm">
        <div className="flex flex-col gap-1 text-center">
          <h1 className="text-2xl font-semibold">OmniMarket</h1>
          <p className="text-sm text-zinc-600">Inicia sesión para entrar al panel.</p>
        </div>

        <div className="flex flex-col gap-3">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <Button className="w-full" type="submit">
              Continuar con Google
            </Button>
          </form>
          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/dashboard" });
            }}
          >
            <Button className="w-full" variant="outline" type="submit">
              Continuar con GitHub
            </Button>
          </form>
        </div>

        {process.env.ENABLE_TEST_LOGIN === "true" && (
          <form
            className="flex flex-col gap-2 border-t pt-4"
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
            />
            <Button data-testid="test-login-submit" variant="secondary" type="submit">
              Acceso de prueba
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}

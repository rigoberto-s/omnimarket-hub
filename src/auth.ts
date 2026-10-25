import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub,
    Google,
    // Acceso de prueba para Playwright: solo existe con ENABLE_TEST_LOGIN=true (local y CI)
    ...(process.env.ENABLE_TEST_LOGIN === "true"
      ? [
          Credentials({
            id: "test-login",
            name: "Acceso de prueba",
            credentials: { email: {} },
            authorize: async (c) =>
              c?.email === "test@omnimarket.dev"
                ? { id: "test-user", name: "Usuario de prueba", email: "test@omnimarket.dev" }
                : null,
          }),
        ]
      : []),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
});

import { AppShell } from "@/components/layout/app-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // TODO: cuando exista src/auth.ts, leer el nombre con `const session = await auth()`
  // (layout async) y pasar signOutAction con una server action que llame a signOut.
  const userName = "Usuario";

  return <AppShell userName={userName}>{children}</AppShell>;
}

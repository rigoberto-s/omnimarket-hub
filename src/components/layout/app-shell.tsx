"use client";

import { useState } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

const SIDEBAR_ID = "app-sidebar";
// Mismo corte que el prefijo lg: de Tailwind
const DESKTOP_QUERY = "(min-width: 1024px)";

type AppShellProps = {
  userName: string;
  signOutAction?: () => Promise<void>;
  children: React.ReactNode;
};

export function AppShell({ userName, signOutAction, children }: AppShellProps) {
  // En escritorio el menú empieza visible; en móvil, oculto
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  function toggleSidebar() {
    if (window.matchMedia(DESKTOP_QUERY).matches) setDesktopOpen((v) => !v);
    else setMobileOpen((v) => !v);
  }

  return (
    <div className="flex min-h-screen">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar
        id={SIDEBAR_ID}
        mobileOpen={mobileOpen}
        desktopOpen={desktopOpen}
        onNavigate={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          userName={userName}
          sidebarId={SIDEBAR_ID}
          sidebarOpen={mobileOpen || desktopOpen}
          onToggleSidebar={toggleSidebar}
          signOutAction={signOutAction}
        />
        <main className="flex-1 bg-zinc-50 p-8">{children}</main>
      </div>
    </div>
  );
}

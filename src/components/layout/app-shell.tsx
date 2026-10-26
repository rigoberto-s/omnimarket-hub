"use client";

import { useEffect, useState } from "react";
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

  // Escape cierra el menú móvil; si el foco estaba dentro, vuelve al botón del menú
  useEffect(() => {
    if (!mobileOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      const focusInside = document.getElementById(SIDEBAR_ID)?.contains(document.activeElement);
      setMobileOpen(false);
      if (focusInside) {
        document.querySelector<HTMLElement>(`[aria-controls="${SIDEBAR_ID}"]`)?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

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
        <main className="flex-1 bg-indigo-50/60 p-8">{children}</main>
      </div>
    </div>
  );
}

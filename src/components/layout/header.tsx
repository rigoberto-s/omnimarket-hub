"use client";

import { LogOutIcon, PanelLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type HeaderProps = {
  userName: string;
  sidebarId: string;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  signOutAction?: () => Promise<void>;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0]?.slice(0, 2);
  return (letters ?? "?").toUpperCase();
}

export function Header({
  userName,
  sidebarId,
  sidebarOpen,
  onToggleSidebar,
  signOutAction,
}: HeaderProps) {
  const signOutButton = (
    <Button type="submit" variant="outline" disabled={!signOutAction}>
      <LogOutIcon aria-hidden="true" />
      Cerrar sesión
    </Button>
  );

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 lg:px-8">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleSidebar}
        aria-controls={sidebarId}
        aria-expanded={sidebarOpen}
        aria-label={sidebarOpen ? "Ocultar menú" : "Mostrar menú"}
      >
        <PanelLeftIcon />
      </Button>

      <div className="ml-auto flex items-center gap-3">
        <span
          className="flex size-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700"
          aria-hidden="true"
        >
          {initials(userName)}
        </span>
        <span className="hidden text-sm font-medium sm:inline">{userName}</span>
        {signOutAction ? <form action={signOutAction}>{signOutButton}</form> : signOutButton}
      </div>
    </header>
  );
}

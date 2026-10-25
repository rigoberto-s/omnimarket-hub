"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";

type SidebarProps = {
  id: string;
  mobileOpen: boolean;
  desktopOpen: boolean;
  onNavigate: () => void;
};

export function Sidebar({ id, mobileOpen, desktopOpen, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      id={id}
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-60 shrink-0 flex-col border-r bg-background transition-transform",
        "lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full",
        !desktopOpen && "lg:hidden",
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <span className="size-7 rounded-md bg-indigo-600" aria-hidden="true" />
        <span className="text-lg font-semibold">OmniMarket</span>
      </div>

      <nav aria-label="Navegación principal" className="flex flex-col gap-1 p-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

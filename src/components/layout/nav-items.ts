import {
  LayoutDashboardIcon,
  PackageIcon,
  ShoppingCartIcon,
  SquareKanbanIcon,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/products", label: "Productos", icon: PackageIcon },
  { href: "/orders", label: "Pedidos", icon: ShoppingCartIcon },
  { href: "/kanban", label: "Kanban", icon: SquareKanbanIcon },
];

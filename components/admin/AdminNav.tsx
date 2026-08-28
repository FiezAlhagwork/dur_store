"use client";

import AdminNavLink from "./AdminNavLink";
import type { AdminNavItem } from "@/types";

interface AdminNavProps {
  items: AdminNavItem[];
  isCollapsed: boolean;
  onNavigate?: () => void;
}

/**
 * The section list. The desktop rail and the mobile drawer render this same
 * component — the drawer simply never collapses it.
 */
export default function AdminNav({
  items,
  isCollapsed,
  onNavigate,
}: AdminNavProps) {
  return (
    <nav className="flex flex-1 flex-col gap-1">
      {items.map((item) => (
        <AdminNavLink
          key={item.href}
          item={item}
          isCollapsed={isCollapsed}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
}

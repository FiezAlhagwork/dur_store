"use client";

import { useCallback, useState } from "react";

const STORAGE_KEY = "dur:admin-sidebar-collapsed";

/**
 * Reads the stored preference, defaulting to expanded.
 *
 * Guarded twice: `window` is absent while rendering on the server, and even in
 * the browser a private window or a "block site data" setting throws on access
 * rather than returning null. Failing to remember a preference must never
 * break the page.
 */
function readStoredCollapsed(): boolean {
  if (typeof window === "undefined") return false;

  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

/**
 * Remembers whether the admin sidebar is collapsed, per browser.
 *
 * The value is read in a lazy initialiser rather than an effect, so the
 * sidebar's very first client render already has the right width — no flash of
 * an expanded rail for someone who prefers it collapsed, and no cascading
 * re-render. That is safe here because `AdminShell` renders its "checking
 * access" screen on the server and only mounts the sidebar once the role has
 * resolved on the client, so there is no server-rendered width to mismatch.
 */
export function useSidebarCollapsed() {
  const [isCollapsed, setIsCollapsed] = useState(readStoredCollapsed);

  const toggle = useCallback(() => {
    setIsCollapsed((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // Not persisting is fine — the choice still applies for this session.
      }
      return next;
    });
  }, []);

  return { isCollapsed, toggle };
}

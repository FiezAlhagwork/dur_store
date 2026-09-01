import type { Metadata } from "next";
import RedirectAfterLoginClient from "./RedirectAfterLoginClient";

// A role-check redirect stop, never a page anyone should land on from a
// search result — no title override, just inherit the site default.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function RedirectAfterLoginPage() {
  return <RedirectAfterLoginClient />;
}

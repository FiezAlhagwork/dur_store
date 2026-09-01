import type { Metadata } from "next";
import SSOCallbackClient from "./SSOCallbackClient";

// A split-second OAuth-redirect stop, never a page anyone should land on
// from a search result — no title override, just inherit the site default.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function SSOCallbackPage() {
  return <SSOCallbackClient />;
}

import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// React Testing Library's automatic cleanup only self-registers for Jest;
// under Vitest it has to be wired up explicitly, or a component rendered in
// one test would still be mounted (and its text findable) in the next.
afterEach(() => {
  cleanup();
});

/**
 * Every section on the site (Hero, AboutUs, FAQ, …) is wrapped in
 * `components/shared/Reveal.tsx`, which animates in via framer-motion's
 * `whileInView` — and `whileInView` requires `IntersectionObserver`, which
 * jsdom does not implement at all (referencing it throws
 * "IntersectionObserver is not defined"). This stub is just enough for
 * `motion.div` to mount without crashing; it never actually reports an
 * element as intersecting, so the "scrolled into view" animation itself
 * stays untriggered in tests — that's framer-motion's own behavior, not
 * this app's logic, and out of scope here. Content inside a `Reveal` is
 * still fully present in the DOM (Testing Library queries and clicks work
 * normally), just visually at its `initial` (hidden) animation state.
 */
class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

// @ts-expect-error — jsdom has no built-in IntersectionObserver to satisfy.
global.IntersectionObserver = IntersectionObserverStub;

/**
 * jsdom implements no scrolling at all and prints "Not implemented: Window's
 * scrollTo() method" to stderr whenever something calls it (framer-motion
 * and next/link both do). Harmless, but it buries real output — so it gets a
 * no-op rather than a warning per test.
 */
window.scrollTo = () => {};

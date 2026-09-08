"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import Reveal from "@/components/shared/Reveal";
import ReviewCard from "./ReviewCard";
import { REVIEWS } from "@/constants";

/** How long each review stays on screen before the carousel advances itself. */
const AUTOPLAY_MS = 6000;

/**
 * "use client" (like FAQ, unlike the server-rendered WhyChooseUs) because
 * this section owns which review is showing.
 *
 * The first carousel in this codebase. It stays deliberately small: state is
 * an index plus the direction it last moved, and the slide transition reuses
 * the `AnimatePresence` + `motion.div` pattern already established in
 * `FAQItem.tsx` and `Preloader.tsx` rather than adding a carousel library.
 */
export default function Reviews() {
  const { t, i18n } = useTranslation("common");
  const isArabic = i18n.language === "ar";
  const prefersReducedMotion = useReducedMotion();

  const [index, setIndex] = useState(0);
  // Which way the last move went, so the outgoing and incoming slides travel
  // the same way the arrow that triggered them points.
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  const goTo = useCallback((next: number, moveDirection: number) => {
    setDirection(moveDirection);
    // Wraps in both directions, so neither arrow is ever a dead end.
    setIndex((next + REVIEWS.length) % REVIEWS.length);
  }, []);

  const goNext = useCallback(() => goTo(index + 1, 1), [goTo, index]);
  const goPrevious = useCallback(() => goTo(index - 1, -1), [goTo, index]);

  /*
   * Advances on its own, but never while someone is interacting with the
   * section — text sliding out from under a reader mid-sentence is worse
   * than no autoplay at all. Also off entirely for `prefers-reduced-motion`:
   * unattended movement is exactly what that setting asks to stop.
   */
  useEffect(() => {
    if (isPaused || prefersReducedMotion) return;

    const timer = setInterval(() => {
      setDirection(1);
      setIndex((current) => (current + 1) % REVIEWS.length);
    }, AUTOPLAY_MS);

    return () => clearInterval(timer);
  }, [isPaused, prefersReducedMotion]);

  // "Previous" points backwards along the reading direction, which flips with
  // the language — same reasoning (and same JS branch, not an `rtl:` variant)
  // as Pagination.tsx.
  const PreviousIcon = isArabic ? ChevronRight : ChevronLeft;
  const NextIcon = isArabic ? ChevronLeft : ChevronRight;

  const arrowClassName =
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/20 text-primary transition-colors hover:bg-primary hover:text-second";

  const review = REVIEWS[index];

  return (
    <section
      className="relative overflow-hidden bg-second py-16 md:py-24"
      id="reviews"
      data-navbar-theme="dark"
    >
      <div className="site-container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-wider text-primary xl:text-base">
            {t("reviews.eyebrow")}
          </span>
          <h2 className="mt-3 font-serif text-3xl font-bold text-primary md:text-4xl xl:text-5xl">
            {t("reviews.title")}
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="mx-auto mt-12 max-w-3xl xl:mt-16">
          <div
            aria-roledescription="carousel"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            // Keyboard users get the same reprieve as mouse users: tabbing
            // into the arrows or dots stops the slide moving under them.
            onFocusCapture={() => setIsPaused(true)}
            onBlurCapture={() => setIsPaused(false)}
          >
            {/*
              A fixed floor under the slide area. Reviews differ in length, and
              without it every transition would resize the section and shove
              the rest of the page up or down.
            */}
            <div
              className="relative min-h-76 sm:min-h-68"
              aria-live="polite"
            >
              {/*
                Keyed `motion.div` with no `AnimatePresence`: changing the key
                remounts it, so `initial` → `animate` replays on every move and
                the new review slides in from whichever side the arrow points.

                No exit animation on purpose. `AnimatePresence mode="wait"`
                would hold the outgoing review on screen for its full exit
                first, leaving the panel empty for a beat between every
                review; letting the two overlap instead would mean absolutely
                positioning them, which risks clipping a long quote against
                the fixed height on a narrow screen. Swapping outright avoids
                both, and an incoming slide reads as the whole transition.
              */}
              <motion.div
                key={review.quoteKey}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <ReviewCard
                  quote={t(review.quoteKey)}
                  name={t(review.nameKey)}
                  location={t(review.locationKey)}
                />
              </motion.div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-5">
              <button
                type="button"
                onClick={goPrevious}
                aria-label={t("reviews.previous")}
                className={arrowClassName}
              >
                <PreviousIcon className="h-4 w-4" aria-hidden="true" />
              </button>

              <div className="flex items-center gap-2.5">
                {REVIEWS.map((item, dotIndex) => {
                  const isActive = dotIndex === index;

                  return (
                    <button
                      key={item.quoteKey}
                      type="button"
                      onClick={() =>
                        goTo(dotIndex, dotIndex > index ? 1 : -1)
                      }
                      aria-label={t("reviews.goTo", { number: dotIndex + 1 })}
                      // The dots communicate position by size and fill alone,
                      // so the current one has to say so out loud too.
                      aria-current={isActive}
                      className={[
                        "rounded-full transition-all duration-300",
                        isActive
                          ? "h-2 w-6 bg-primary"
                          : "h-2 w-2 bg-primary/25 hover:bg-primary/50",
                      ].join(" ")}
                    />
                  );
                })}
              </div>

              <button
                type="button"
                onClick={goNext}
                aria-label={t("reviews.next")}
                className={arrowClassName}
              >
                <NextIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

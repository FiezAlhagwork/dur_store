"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Preloader from "@/components/site/Home/Preloader";
import Button from "@/components/ui/Button";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/hooks/useSettings";
import { getOptimizedVideoUrl } from "@/utils/video";

const curveEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function Hero() {
  const { i18n } = useTranslation("common");
  const isArabic = i18n.language === "ar";
  const { settings, isPending: settingsPending } = useSettings();
  const hero = settings.home_hero;

  const [isLoaded, setIsLoaded] = useState(false);

  const titleLine1 = isArabic ? hero.title_line1_ar : hero.title_line1_en;
  const titleLine2 = isArabic ? hero.title_line2_ar : hero.title_line2_en;
  const description = isArabic ? hero.description_ar : hero.description_en;
  const primaryLabel = isArabic
    ? hero.primary_button_label_ar
    : hero.primary_button_label_en;
  const secondaryLabel = isArabic
    ? hero.secondary_button_label_ar
    : hero.secondary_button_label_en;

  return (
    <>
      <Preloader onComplete={() => setIsLoaded(true)} />
      <section
        className="relative h-[200vh] bg-second"
        id="hero"
        data-navbar-theme="light"
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/*
            No controls, no click target — this is ambient background, not a
            piece of content someone plays or pauses. `poster` is what actually
            removes the "loading" look you were seeing: without it the browser
            has nothing to paint until the video has a decoded frame, which on
            a slow connection is a stretch of black (or, on some mobile
            browsers, their own default loading affordance). With a poster, the
            image is what's on screen from the first paint, and the browser
            swaps to the video on its own the moment a frame is ready — no
            spinner, no state, no JS to write for that swap.

            `src` sits directly on the element rather than in a nested
            `<source type="video/mp4">`. The upload form now accepts mp4,
            webm and mov, so a hardcoded MIME type here would be wrong for two
            of those three and could make a browser skip a file it can
            actually play. A single dynamic URL doesn't need the multi-source
            fallback pattern in the first place.

            `!settingsPending` gates the whole element, not just its `src`.
            `useSettings()` falls back to `DEFAULT_SETTINGS` — including the
            43MB video bundled in `public/` — while the real settings request
            is still in flight, on every single page load (no SSR prefetch
            hydrates this query). Rendering the video immediately would start
            `preload="auto"` eagerly downloading that local file, only to
            abort it a moment later when the real Cloudinary URL arrives and
            `key={hero.video_url}` forces a remount — a wasted download on
            every visit, which is the "loading in the background" you were
            seeing. Waiting for the query to settle (success or an exhausted
            retry) means the video mounts once, with the right source, and
            the local file still does its job as a last-resort fallback if
            settings truly fail to load — just not as a placeholder while
            they're merely still loading.
          */}
          {!settingsPending && (
            <video
              key={hero.video_url}
              src={getOptimizedVideoUrl(hero.video_url)}
              poster={hero.poster_url || undefined}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              // @ts-expect-error — `fetchPriority` is real on the DOM (the
              // attribute browsers read is `fetchpriority`, lowercase, same as
              // any other HTML attribute), but React's types only declare it
              // for <img>, <link> and <script>, not <video>. Harmless either
              // way: a browser without support just ignores it.
              fetchPriority="high"
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 h-[101%] w-full -translate-x-1/2 -translate-y-1/2 object-cover"
            />
          )}

          <div className="absolute inset-0 bg-linear-to-l from-primary/55 via-primary/20 to-transparent z-10" />

          <div className="relative z-20 flex h-[calc(100vh-80px)] items-center px-6 md:px-32">
            <motion.div
              className={[
                "w-full max-w-lg text-center",
                isArabic ? "md:text-right" : "md:text-left",
              ].join(" ")}
            >
              <motion.h1
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={isLoaded ? { opacity: 1, y: 0, scale: 1 } : undefined}
                transition={{ duration: 1.05, ease: curveEase }}
                className={`${
                  isArabic
                    ? "text-[clamp(2.3rem,7vw,4.2rem)] font-bold"
                    : "text-[clamp(2rem,5vw,2.6rem)] font-extrabold"
                } mt-28 font-serif text-second md:leading-[1.3] tracking-[0.03em] drop-shadow-[0_10px_35px_rgba(0,0,0,0.35)] md:mt-50`}
              >
                {titleLine1}
                <br />
                {titleLine2}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={isLoaded ? { opacity: 1, y: 0 } : undefined}
                transition={{
                  duration: 0.9,
                  delay: 0.14,
                  ease: curveEase,
                }}
                className="mt-8 text-[15px] text-second font-serif tracking-[0.04em] md:text-[1.05rem]"
              >
                {description}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={isLoaded ? { opacity: 1, y: 0 } : undefined}
                transition={{
                  duration: 0.9,
                  delay: 0.24,
                  ease: curveEase,
                }}
                className="mt-8 flex flex-col items-center gap-4 font-sans sm:flex-row"
              >
                <Button
                  href={hero.secondary_button_url}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  {secondaryLabel}
                </Button>
                <Button
                  href={hero.primary_button_url}
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  {primaryLabel}
                </Button>
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            className="absolute bottom-10 left-1/2 z-30 -translate-x-1/2 pointer-events-none"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs tracking-[6px] text-second">scroll</span>
              <div className="w-5 h-8 rounded-full border-2 border-second flex justify-center p-1">
                <motion.div
                  animate={
                    isLoaded
                      ? { y: [0, 10, 0], opacity: [1, 0, 1] }
                      : { y: 0, opacity: 1 }
                  }
                  transition={{
                    duration: 1.5,
                    repeat: isLoaded ? Infinity : 0,
                    ease: "easeInOut",
                  }}
                  className="w-1 h-2 bg-second rounded-full"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

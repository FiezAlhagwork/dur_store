import { Quote } from "lucide-react";
import type { ReviewCardProps } from "@/types";

/**
 * One testimonial. No `"use client"` — it holds no state and receives
 * already-translated strings, exactly like `WhyChooseUsCard`; the carousel
 * around it (`Reviews.tsx`) is the client component.
 *
 * The glass panel is the house card style, identical to `WhyChooseUsCard`,
 * `ContactCTA` and `RedirectAfterLoginClient` rather than a fourth variation
 * of it.
 */
export default function ReviewCard({ quote, name, location }: ReviewCardProps) {
  return (
    <figure className="relative overflow-hidden rounded-[28px] border border-white/50 bg-background/25 p-8 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5),0_8px_30px_-12px_rgba(29,6,52,0.15)] backdrop-blur-lg backdrop-saturate-150 sm:p-10 xl:p-12">
      {/*
        The section carries no `eger.webp` ornament (its neighbours already
        place one on each side of it), so this oversized quote mark is what
        gives the panel its visual anchor. Decorative only — the quote itself
        is right below it in the text.
      */}
      <Quote
        className="pointer-events-none absolute -top-2 start-4 h-20 w-20 text-primary/8 sm:h-28 sm:w-28"
        strokeWidth={1.5}
        aria-hidden="true"
      />

      <blockquote className="relative font-serif text-lg leading-relaxed text-primary sm:text-xl xl:text-2xl">
        {`“${quote}”`}
      </blockquote>

      <figcaption className="relative mt-7 flex flex-col items-center gap-2">
        {/* Same hairline the other cards use, as a divider rather than a
            hover affordance — nothing here is interactive. */}
        <span className="block h-px w-10 bg-primary/25" aria-hidden="true" />
        <span className="font-serif text-base font-bold text-primary">
          {name}
        </span>
        <span className="text-xs text-foreground/60 sm:text-sm">{location}</span>
      </figcaption>
    </figure>
  );
}

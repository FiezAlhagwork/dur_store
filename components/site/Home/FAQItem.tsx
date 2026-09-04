"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import Reveal from "@/components/shared/Reveal";
import type { FAQItemProps } from "@/types";

/**
 * One row of the homepage FAQ accordion (FAQ.tsx). The first
 * expand/collapse component in this codebase — the height/opacity animation
 * on the answer follows the same `AnimatePresence` + `motion.div` pattern
 * already used in Preloader.tsx, the only other place it appears.
 */
export default function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
  index,
}: FAQItemProps) {
  return (
    <Reveal
      delay={Math.min(index * 0.06, 0.3)}
      className="border-b border-primary/10 last:border-b-0"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 py-5 text-start"
      >
        <span className="font-serif text-base font-bold text-primary sm:text-lg">
          {question}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-primary transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-foreground/70 sm:text-base">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </Reveal>
  );
}

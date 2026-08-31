"use client";

import { forwardRef, useId } from "react";
import { TextareaProps } from "@/types";

const TEXTAREA_SIZES = {
  // See the matching comment in Input.tsx: text-base below `sm:` keeps a
  // focused textarea at/above the 16px iOS Safari zoom-on-focus threshold,
  // sm:text-sm restores the original size from 640px up.
  md: "px-4 py-2.5 text-base sm:text-sm",
  sm: "px-3.5 py-2 text-base sm:text-sm",
} as const;

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      label,
      error,
      hint,
      size = "md",
      className = "",
      containerClassName = "",
      id,
      rows = 4,
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const descriptionId = error
      ? `${inputId}-error`
      : hint
        ? `${inputId}-hint`
        : undefined;

    const stateClassName = error
      ? "border-red-400 bg-red-500/5 focus:border-red-500 focus:bg-background/80 focus:ring-red-500/15"
      : "border-primary/15 bg-background/50 focus:border-primary focus:bg-background/80 focus:ring-primary/15";

    return (
      <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-primary">
            {label}
          </label>
        )}

        <textarea
          id={inputId}
          ref={ref}
          rows={rows}
          aria-invalid={!!error}
          aria-describedby={descriptionId}
          className={[
            "w-full resize-none rounded-2xl border text-primary outline-none backdrop-blur-sm transition-all duration-200",
            "placeholder:text-foreground/40",
            "focus:ring-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            TEXTAREA_SIZES[size],
            stateClassName,
            className,
          ].join(" ")}
          {...props}
        />

        {error ? (
          <p id={descriptionId} className="text-xs text-red-500">
            {error}
          </p>
        ) : hint ? (
          <p id={descriptionId} className="text-xs text-foreground/50">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

export default Textarea;
"use client";

import { forwardRef, useId } from "react";
import { ChevronDown } from "lucide-react";
import { SelectProps } from "@/types";

const SELECT_SIZES = {
  lg: "px-4 py-3.5 text-lg",
  // See the matching comment in Input.tsx: text-base below `sm:` keeps
  // focused selects at/above the 16px iOS Safari zoom-on-focus threshold,
  // sm:text-sm restores the original size from 640px up.
  md: "px-4 py-2.5 text-base sm:text-sm",
  sm: "px-3.5 py-2 text-base sm:text-sm",
} as const;

/**
 * Dropdown built on a native `<select>`, matching `Input`/`Textarea` field for
 * field (label, error, hint, `forwardRef` so react-hook-form's `register`
 * works unchanged).
 *
 * Native rather than a custom listbox because both uses so far — category and
 * karat — are short, flat lists where the platform control is more accessible
 * and better on mobile than anything hand-rolled.
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    error,
    hint,
    size = "md",
    className = "",
    containerClassName = "",
    id,
    children,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const descriptionId = error
    ? `${selectId}-error`
    : hint
      ? `${selectId}-hint`
      : undefined;

  const stateClassName = error
    ? "border-red-400 bg-red-500/5 focus:border-red-500 focus:ring-red-500/15"
    : "border-primary/15 bg-background/50 focus:border-primary focus:ring-primary/15";

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-primary">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={descriptionId}
          className={[
            "w-full appearance-none rounded-2xl border text-primary outline-none transition-all duration-200",
            "focus:ring-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            // Room for the chevron on whichever side the language ends at.
            "pe-10",
            SELECT_SIZES[size],
            stateClassName,
            className,
          ].join(" ")}
          {...props}
        >
          {children}
        </select>

        <ChevronDown
          className="pointer-events-none absolute inset-y-0 end-3 my-auto h-4 w-4 text-primary/40"
          aria-hidden="true"
        />
      </div>

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
});

export default Select;

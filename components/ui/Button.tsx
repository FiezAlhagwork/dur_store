"use client";

import { ButtonProps } from "@/types";
import Link from "next/link";
import { Loader2 } from "lucide-react";

const BUTTON_VARIANTS = {
  primary: {
    className: "bg-primary text-second",
  },
  secondary: {
    className: "bg-second text-primary",
  },
  // `outline` is cream-on-translucent: it only reads on a dark surface such as
  // the hero. `surface` and `ghost` are its counterparts for light surfaces
  // (the auth card, forms) where cream text would disappear.
  outline: {
    className: "border border-second/20 bg-second/15 text-second",
  },
  surface: {
    className:
      "border border-primary/15 bg-background text-primary shadow-[0_1px_2px_0_rgba(29,6,52,0.06)] hover:border-primary/30 hover:shadow-[0_6px_18px_-8px_rgba(29,6,52,0.28)]",
  },
  ghost: {
    className: "bg-transparent text-primary/60 hover:text-primary",
  },
  // For destructive actions (delete). No prior destructive pattern existed in
  // this component, so this is the app's first — solid red rather than a
  // subtle tint, since a delete button should never read as secondary.
  danger: {
    className: "bg-red-600 text-white hover:bg-red-700",
  },
  filterActive: {
    className: "border border-primary bg-primary text-second",
  },
  filterInactive: {
    className:
      "border border-primary/20 bg-transparent text-primary hover:bg-primary/5",
  },
} as const;

const BUTTON_SIZES = {
  // `lg` is the full-width form button: taller, so it reads as the primary
  // target on a page that is nothing but a form.
  lg: "px-6 py-3.5 text-[15px] font-bold font-serif",
  md: "px-5 py-2 text-[15px] font-bold font-serif",
  sm: "px-4 py-2 text-sm font-medium sm:px-5",
} as const;

export default function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  target,
  rel,
  isLoading = false,
  disabled,
  ...props
}: ButtonProps) {
  // The disabled rules matter for every `isLoading` button too, since loading
  // disables it: without them a busy or cooling-down button still grows on
  // hover and reads as clickable.
  const baseClassName = [
    "inline-flex items-center justify-center rounded-2xl transition-all duration-200 hover:scale-[1.03]",
    "disabled:pointer-events-none disabled:opacity-55 disabled:hover:scale-100",
  ].join(" ");

  const finalClassName = [
    baseClassName,
    BUTTON_SIZES[size],
    BUTTON_VARIANTS[variant].className,
    className,
  ].join(" ");

  if (href) {
    return (
      <Link href={href} className={finalClassName} target={target} rel={rel}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={finalClassName}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

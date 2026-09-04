import { Locale } from "@/i18n/config";
import { Gem, LucideIcon } from "lucide-react";
import { TargetAndTransition } from "motion";
import type { TextareaHTMLAttributes } from "react";

import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";

export type AboutStat = {
  icon: typeof Gem;
  value: string;
  labelKey: string;
};

export interface CountUpProps {
  value: string;
  duration?: number;
  className?: string;
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  children: ReactNode;
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "surface"
    | "ghost"
    | "danger"
    | "filterActive"
    | "filterInactive";
  size?: "lg" | "md" | "sm";
  className?: string;
  target?: string;
  rel?: string;
  isLoading?: boolean;
}

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  hint?: string;
  size?: "lg" | "md" | "sm";
  containerClassName?: string;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  error?: string;
  hint?: string;
  size?: "lg" | "md" | "sm";
  containerClassName?: string;
}

export interface NavigationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  once?: boolean;
  margin?: string;
  whileHover?: TargetAndTransition;
}

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  size?: "md" | "sm";
  containerClassName?: string;
} 


export  interface CategoryCardProps {
  name: string;
  slug: string;
  /** Null when the category has no image — the API allows that. */
  image: string | null;
  locale: Locale;
}


/**
 * One section in the admin sidebar, already localised and resolved against the
 * current path (see constants/admin-nav.ts).
 */
export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  isActive: boolean;
}

export interface WhyChooseUsCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
}

/**
 * One accordion row in the homepage FAQ section. `isOpen`/`onToggle` are
 * lifted to the parent (`FAQ.tsx`) rather than kept as local state here, so
 * the parent can enforce "opening one question closes whichever was open" —
 * that only works if there's a single source of truth for which index is
 * open, not one independent per item.
 */
export interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}

/** Which auth intent a page represents. Both pages support both outcomes —
 * e.g. `login` silently continues into account creation when the email is
 * new (see lib/auth/orchestration.ts) — this only decides which Clerk call
 * is attempted first and the page copy. */
export type AuthMode = "login" | "register";

/** Step shown inside the login/register page's own step controller. */
export type AuthStep = "method" | "email" | "code";

/** Which Clerk resource (SignIn or SignUp) the in-progress attempt is
 * currently driven by. Set once the email step succeeds, read by the code
 * step to know which resource to call `emailCode`/`verifications` on. */
export type AuthPendingFlow = "signIn" | "signUp";

/** UI state for the code step, derived from Clerk's verification status
 * (see lib/auth/orchestration.ts for how each value is produced). */
export type CodeState =
  | "awaiting"
  | "verifying"
  | "wrongCode"
  | "expired"
  | "error";
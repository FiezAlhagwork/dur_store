"use client";

import { AlertCircle } from "lucide-react";


export default function AuthError({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-500/5 px-4 py-3 text-xs leading-relaxed text-red-600"
    >
      <AlertCircle className="mt-px h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}

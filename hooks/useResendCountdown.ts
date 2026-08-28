"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseResendCountdownReturn {
  /** Seconds left before resend is allowed again. 0 means ready. */
  remaining: number;
  /** True while `remaining` is counting down. */
  isActive: boolean;
  /** Seeds the countdown, e.g. right after a (re)send call succeeds. */
  start: () => void;
  /** Clears the countdown immediately (e.g. when leaving the code step). */
  reset: () => void;
}

/**
 * Simple ticking-down countdown for a "resend code" button, driven by
 * `setInterval` (1s tick), cleared on unmount. Distinct from
 * `components/shared/CountUp.tsx`, which counts *up* on scroll-into-view —
 * different purpose and trigger, only the general interval idea is shared.
 */
export function useResendCountdown(seconds: number): UseResendCountdownReturn {
  const [remaining, setRemaining] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clear();
    setRemaining(seconds);
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clear();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [seconds, clear]);

  const reset = useCallback(() => {
    clear();
    setRemaining(0);
  }, [clear]);

  useEffect(() => clear, [clear]);

  return { remaining, isActive: remaining > 0, start, reset };
}

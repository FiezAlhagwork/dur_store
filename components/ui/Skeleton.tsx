/**
 * The atomic loading placeholder every skeleton in the app is built from —
 * same idea as `Button`/`Input`: one small primitive, reused everywhere
 * instead of ad-hoc `animate-pulse` divs at each call site (which is how the
 * dashboard's first skeleton started out).
 *
 * It carries no size or shape opinion — `className` supplies the width,
 * height and radius for whatever it stands in for. `SkeletonText`,
 * `SkeletonAvatar` and `SkeletonCard` below cover the shapes that repeat
 * across the app; reach for a bare `Skeleton` for anything more specific.
 *
 * `aria-hidden` because it is purely decorative — the loading state itself is
 * announced once, by `SkeletonGroup`, not by every bar inside it.
 */
export default function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-primary/8 ${className}`}
    />
  );
}

/**
 * Wraps a set of `Skeleton` pieces with the accessibility announcement they
 * share: `role="status"` plus one screen-reader-only "loading" label, so a
 * screen reader says it once for the group instead of once per bar (or not at
 * all, since the bars themselves are `aria-hidden`).
 *
 * Every skeleton layout in the app should have exactly one of these as its
 * outermost element.
 */
export function SkeletonGroup({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div role="status" aria-live="polite" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

/** One or more placeholder text lines. The last line is shorter, matching how a real line of text rarely fills the full width it wraps at. */
export function SkeletonText({
  lines = 1,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={`h-3.5 ${index === lines - 1 && lines > 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
    </div>
  );
}

/** A round placeholder for an avatar, logo, or icon badge. */
export function SkeletonAvatar({ className = "h-11 w-11" }: { className?: string }) {
  return <Skeleton className={`rounded-full ${className}`} />;
}

/**
 * A generic card outline: matches the `rounded-3xl border ... bg-background`
 * shell used throughout the admin area (see `DashboardSection`,
 * `StatCards`), so a page's loading state can share its skeleton's silhouette
 * with its loaded content without repeating those classes at every call site.
 */
export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-3xl border border-primary/10 bg-background p-5 sm:p-6 ${className}`}
    >
      <Skeleton className="h-4 w-1/3" />
      <div className="mt-4 flex flex-col gap-3">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-5/6" />
        <Skeleton className="h-3.5 w-2/3" />
      </div>
    </div>
  );
}

/**
 * One row of a `ProductMiniList`-shaped list — thumbnail, two lines of text,
 * a trailing value — for any list of that shape still loading.
 */
export function SkeletonListRow({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 py-3 ${className}`}>
      <SkeletonAvatar className="h-11 w-11 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1">
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="mt-2 h-3 w-1/3" />
      </div>
      <Skeleton className="h-5 w-14 shrink-0 rounded-full" />
    </div>
  );
}

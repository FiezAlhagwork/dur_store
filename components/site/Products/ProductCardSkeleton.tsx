import Skeleton from "@/components/ui/Skeleton";

/**
 * Placeholder for one `ProductCard` while the public grid's first page is
 * loading.
 *
 * Not `SkeletonCard` from `components/ui/Skeleton.tsx` — that one is shaped
 * for the dashboard's text-led list cards (a title and a few lines, no
 * image), and would not read as a product tile. This mirrors `ProductCard`'s
 * own layout instead: a photo-height block, a category-width line, a
 * name-width line, then a button-height bar.
 */
export default function ProductCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-2xl border border-primary/10 bg-background"
    >
      <Skeleton className="aspect-4/5 w-full rounded-none" />

      <div className="p-4 pt-3 sm:p-5 sm:pt-4">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="mt-2 h-4 w-2/3" />
        <Skeleton className="mt-3 h-10 w-full rounded-2xl" />
      </div>
    </div>
  );
}

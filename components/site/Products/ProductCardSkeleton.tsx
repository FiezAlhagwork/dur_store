import Skeleton from "@/components/ui/Skeleton";

/**
 * Placeholder for one `ProductCard` while the public grid's first page is
 * loading.
 *
 * Not `SkeletonCard` from `components/ui/Skeleton.tsx` — that one is shaped
 * for the dashboard's text-led list cards (a title and a few lines, no
 * image), and would not read as a product tile. This mirrors `ProductCard`'s
 * own layout instead: a photo-height block, then a caption-shaped pair of
 * lines, then a button-height bar.
 */
export default function ProductCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-2xl border border-primary/10 bg-background"
    >
      <Skeleton className="h-40 w-full rounded-none md:h-80 lg:h-70" />

      <div className="p-4 pt-3 sm:p-5 sm:pt-4">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="mt-3 h-10 w-full rounded-2xl" />
      </div>
    </div>
  );
}

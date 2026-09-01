import Image from "next/image";
import type { ReactNode } from "react";
import type { ProductImage } from "@/types/product";

interface ProductCardImageProps {
  images: ProductImage[];
  alt: string;
  className?: string;
  badge?: ReactNode;
}

/**
 * Product-card-only image presentation — deliberately not
 * ProductImageCarousel, which stays exactly as-is for the product detail
 * page (full manual browsing through every photo, a different job). This
 * one has no buttons and no click-driven state at all: the primary photo
 * always shows, and on desktop, hovering the card crossfades in a second
 * photo (a different angle) over it via pure CSS.
 *
 * `lg:pointer-fine:group-hover` is the same compound variant
 * ProductImageCarousel's own arrow buttons already use to stay
 * desktop-hover-only — reused here, not invented fresh. On a touch device
 * that selector never matches (no `lg` + fine pointer at once), so the
 * second image simply never becomes visible — nothing to special-case for
 * "no image switching on mobile".
 *
 * White background + object-contain + padding, not the tinted
 * object-cover treatment ProductImageCarousel uses: these are pre-cut PNGs
 * with a transparent background, and a plain white canvas is what makes
 * every product read at a consistent visual size regardless of its real
 * dimensions or crop.
 */
export default function ProductCardImage({
  images,
  alt,
  className = "",
  badge,
}: ProductCardImageProps) {
  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
  const primaryIndex = sorted.findIndex((img) => img.is_primary);
  const primary = sorted[primaryIndex >= 0 ? primaryIndex : 0];
  const secondary = sorted.find((img) => img !== primary);

  return (
    <div
      className={`relative w-full overflow-hidden bg-background p-6 ${className}`}
    >
      {primary && (
        <Image
          src={primary.path}
          alt={alt}
          fill
          className="object-contain"
          sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
        />
      )}

      {secondary && (
        <Image
          src={secondary.path}
          alt=""
          aria-hidden="true"
          fill
          className="object-contain opacity-0 transition-opacity duration-300 lg:pointer-fine:group-hover:opacity-100"
          sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
        />
      )}

      {badge && (
        <span className="absolute top-3 inset-s-3 z-10 rounded-full bg-primary/90 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-second shadow-sm backdrop-blur-sm">
          {badge}
        </span>
      )}
    </div>
  );
}

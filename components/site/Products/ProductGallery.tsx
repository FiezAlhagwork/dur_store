"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import type { ProductImage } from "@/types/product";

interface ProductGalleryProps {
  images: ProductImage[];
  alt: string;
  className?: string;
  badge?: ReactNode;
}

/**
 * The product detail page's image display: a large main photo plus a row of
 * thumbnails below it — click one to swap the main photo.
 *
 * This file used to be ProductImageCarousel (arrow-button navigation, no
 * thumbnails). Once the product card moved to its own ProductCardImage, this
 * page became the carousel's only remaining consumer, so it was rebuilt in
 * place as a thumbnail gallery instead of adding a third, parallel
 * component — the arrows it used to have are gone rather than kept
 * alongside, since the thumbnails now cover the same job more visibly.
 */
export default function ProductGallery({
  images,
  alt,
  className = "",
  badge,
}: ProductGalleryProps) {
  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
  const primaryIndex = sorted.findIndex((img) => img.is_primary);
  const [selectedIndex, setSelectedIndex] = useState(
    primaryIndex >= 0 ? primaryIndex : 0,
  );

  const hasImages = sorted.length > 0;
  const hasMultipleImages = sorted.length > 1;
  const selected = sorted[selectedIndex];

  return (
    <div className="flex flex-col gap-3">
      <div
        className={`relative w-full overflow-hidden rounded-2xl border border-primary/10 ${className}`}
      >
        {hasImages ? (
          <Image
            src={selected.path}
            alt={alt}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary/5 text-primary/30">
            <ImageOff className="h-6 w-6" aria-hidden="true" />
          </div>
        )}

        {badge && (
          <span className="absolute top-3 inset-s-3 z-10 rounded-full bg-primary/90 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-second shadow-sm backdrop-blur-sm">
            {badge}
          </span>
        )}
      </div>

      {hasMultipleImages && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sorted.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`${alt} ${index + 1}`}
              aria-current={index === selectedIndex}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors duration-200 sm:h-20 sm:w-20 ${
                index === selectedIndex
                  ? "border-primary"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={image.path}
                alt=""
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { ReactNode, useState, type MouseEvent } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ProductImage } from "@/types/product";

interface ProductImageCarouselProps {
  images: ProductImage[];
  alt: string;
  className?: string;
  badge?: ReactNode;
  caption?: ReactNode;
}

export default function ProductImageCarousel({
  images,
  alt,
  className = "",
  badge,
  caption,
}: ProductImageCarouselProps) {
  const { t } = useTranslation("common");

  const sortedImages = [...images].sort((a, b) => a.sort_order - b.sort_order);
  const primaryIndex = sortedImages.findIndex((img) => img.is_primary);
  const [currentIndex, setCurrentIndex] = useState(
    primaryIndex >= 0 ? primaryIndex : 0,
  );

  const hasImages = sortedImages.length > 0;
  const hasMultipleImages = sortedImages.length > 1;
  const currentImage = sortedImages[currentIndex];

  const goToPrevious = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(
      (prev) => (prev - 1 + sortedImages.length) % sortedImages.length,
    );
  };

  const goToNext = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % sortedImages.length);
  };

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      {/*
        A product with no images used to make this whole component return
        `null` — which also erased the name, price and out-of-stock badge,
        since ProductCard passes them in as `caption`/`badge` *props of this
        component* rather than rendering them independently. The fallback
        below keeps every sibling element on screen; only the photo itself is
        replaced.
      */}
      {hasImages ? (
        <Image
          src={currentImage.path}
          alt={alt}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 90vw"
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

      {hasMultipleImages && (
        <>
          <button
            type="button"
            onClick={goToPrevious}
            aria-label={t("products.previousImage")}
            className="absolute  inset-y-1/2 left-0 z-10 flex h-fit items-center justify-center bg-second/60 rounded-br-2xl rounded-ss-2xl px-2 text-primary backdrop-blur-sm transition-colors duration-200  lg:pointer-fine:opacity-0 lg:pointer-fine:group-hover:opacity-100 sm:px-2 py-4"
          >
            <ChevronLeft size={18} className="drop-shadow-sm" />
          </button>

          <button
            type="button"
            onClick={goToNext}
            aria-label={t("products.nextImage")}
            className="absolute inset-y-1/2 right-0 z-10 flex h-fit items-center justify-center bg-second/60 rounded-bl-2xl rounded-se-2xl px-2 text-primary backdrop-blur-sm transition-colors duration-200 lg:pointer-fine:opacity-0 lg:pointer-fine:group-hover:opacity-100 sm:px-2 py-4"
          >
            <ChevronRight size={18} className="drop-shadow-sm" />
          </button>
        </>
      )}

      {caption && (
        <div className="absolute inset-x-2.5 bottom-2.5 z-10 sm:inset-x-3 sm:bottom-3">
          {caption}
        </div>
      )}
    </div>
  );
}

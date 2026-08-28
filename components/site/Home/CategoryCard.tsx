import Image from "next/image";
import Link from "next/link";
import { CategoryCardProps } from "@/types";

export default function CategoryCard({
  name,
  slug,
  image,
  locale,
}: CategoryCardProps) {
  return (
    <Link
      href={`/${locale}/products?category=${slug}`}
      className="group relative block aspect-4/5 overflow-hidden rounded-2xl border border-primary/10 bg-second shadow-[0_1px_3px_-1px_rgba(29,6,52,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/15 hover:shadow-[0_24px_48px_-24px_rgba(29,6,52,0.3)]"
    >
      {/* The API returns a null image for categories that have none, so the
          card falls back to its own background rather than passing an empty
          src to next/image (which throws). */}
      {image && (
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 45vw"
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-primary/80 via-primary/10 to-transparent" />
      <span className="absolute inset-x-0 bottom-0 p-4 text-center font-serif text-base font-semibold text-second sm:text-lg">
        {name}
      </span>
    </Link>
  );
}

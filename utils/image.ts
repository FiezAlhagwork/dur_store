/**
 * Same idea as `getOptimizedVideoUrl` (utils/video.ts), for a Cloudinary
 * image URL — currently only the Hero video's `poster` attribute
 * (components/site/Home/Hero.tsx), which was being served as a raw uploaded
 * PNG with no transformation at all (a Lighthouse mobile audit flagged it as
 * the page's LCP element: ~776KB, most of it recoverable by format alone).
 *
 * `f_auto` serves WebP/AVIF to browsers that support it instead of the
 * uploaded format; `q_auto` picks a size-appropriate quality. `c_limit,w_1920`
 * caps the delivered width without upscaling anything smaller — the poster
 * fills the viewport edge-to-edge (`w-full object-cover` in Hero.tsx), so
 * nothing wider than a large desktop viewport is ever actually needed.
 *
 * A no-op for anything that isn't a Cloudinary image URL — in particular any
 * bundled local fallback under `/public`, which is a plain path, not a
 * Cloudinary URL, and must pass through unchanged.
 */
export function getOptimizedImageUrl(url: string): string {
  const marker = "/image/upload/";
  const index = url.indexOf(marker);
  if (index === -1) return url;

  const insertAt = index + marker.length;
  return `${url.slice(0, insertAt)}f_auto,q_auto,c_limit,w_1920/${url.slice(insertAt)}`;
}

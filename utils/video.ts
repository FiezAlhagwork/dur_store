/**
 * Asks Cloudinary for a web-optimized delivery instead of the raw uploaded
 * file, by inserting a transformation segment into the URL path.
 *
 * `q_auto` picks a quality/bitrate Cloudinary judges appropriate for the
 * content; `f_auto` serves whichever codec/container the requesting browser
 * handles best (commonly a much smaller file than the MP4 that was uploaded).
 * Both are computed on Cloudinary's side and cached at their CDN edge, so
 * this costs nothing beyond the URL rewrite.
 *
 * Confirmed against a real response rather than assumed: a settings video
 * upload came back as
 * `https://res.cloudinary.com/wvuin1xm/video/upload/v1/settings/….mp4`,
 * matching the `/video/upload/` marker this looks for.
 *
 * A no-op for anything that doesn't match — in particular the bundled local
 * fallback under `/public`, which is a plain path, not a Cloudinary URL, and
 * must pass through unchanged.
 */
export function getOptimizedVideoUrl(url: string): string {
  const marker = "/video/upload/";
  const index = url.indexOf(marker);
  if (index === -1) return url;

  const insertAt = index + marker.length;
  return `${url.slice(0, insertAt)}q_auto,f_auto/${url.slice(insertAt)}`;
}

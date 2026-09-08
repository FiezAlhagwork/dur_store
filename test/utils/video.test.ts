import { describe, it, expect } from "vitest";
import { getOptimizedVideoUrl } from "@/utils/video";

describe("getOptimizedVideoUrl", () => {
  it("inserts the transformation segment right after /video/upload/", () => {
    // Matches the exact shape confirmed against a real response, per the
    // function's own comment.
    const url =
      "https://res.cloudinary.com/wvuin1xm/video/upload/v1/settings/clip.mp4";
    expect(getOptimizedVideoUrl(url)).toBe(
      "https://res.cloudinary.com/wvuin1xm/video/upload/q_auto,f_auto/v1/settings/clip.mp4",
    );
  });

  it("passes a non-Cloudinary URL through unchanged", () => {
    expect(getOptimizedVideoUrl("/video-dur-store.MP4")).toBe(
      "/video-dur-store.MP4",
    );
  });

  it("passes a Cloudinary image URL through unchanged (wrong marker)", () => {
    const url = "https://res.cloudinary.com/wvuin1xm/image/upload/v1/x.png";
    expect(getOptimizedVideoUrl(url)).toBe(url);
  });
});

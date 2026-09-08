import { describe, it, expect } from "vitest";
import { getOptimizedImageUrl } from "@/utils/image";

describe("getOptimizedImageUrl", () => {
  it("inserts the transformation segment right after /image/upload/", () => {
    const url =
      "https://res.cloudinary.com/wvuin1xm/image/upload/v1/hero/poster.png";
    expect(getOptimizedImageUrl(url)).toBe(
      "https://res.cloudinary.com/wvuin1xm/image/upload/f_auto,q_auto,c_limit,w_1920/v1/hero/poster.png",
    );
  });

  it("passes a non-Cloudinary URL through unchanged", () => {
    // The bundled local fallback under /public — a plain path, not a
    // Cloudinary URL, per the function's own comment.
    expect(getOptimizedImageUrl("/deff.webp")).toBe("/deff.webp");
  });

  it("passes a Cloudinary URL with no /image/upload/ marker through unchanged", () => {
    const url = "https://res.cloudinary.com/wvuin1xm/raw/upload/v1/file.pdf";
    expect(getOptimizedImageUrl(url)).toBe(url);
  });

  it("does not touch a URL that already carries transformations", () => {
    // Confirms the insertion is a plain string operation at the first
    // marker occurrence, not something that tries to merge with existing
    // transformation params — an already-transformed URL just gets a
    // second one prepended, matching what a literal `indexOf` + splice does.
    const url =
      "https://res.cloudinary.com/wvuin1xm/image/upload/w_200/v1/thumb.png";
    expect(getOptimizedImageUrl(url)).toBe(
      "https://res.cloudinary.com/wvuin1xm/image/upload/f_auto,q_auto,c_limit,w_1920/w_200/v1/thumb.png",
    );
  });
});

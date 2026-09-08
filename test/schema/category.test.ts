import { describe, it, expect } from "vitest";
import { getCategorySchema } from "@/schema/category";
import { fakeT } from "../helpers/fakeT";

const schema = getCategorySchema(fakeT);

const validBase = {
  name_ar: "خواتم",
  name_en: "Rings",
  slug: "rings",
  is_active: true,
  image: null,
};

describe("getCategorySchema", () => {
  it("accepts a valid category with no image", () => {
    expect(schema.safeParse(validBase).success).toBe(true);
  });

  it("rejects a name shorter than 2 characters", () => {
    const result = schema.safeParse({ ...validBase, name_ar: "خ" });
    const issue = result.error?.issues.find((i) => i.path[0] === "name_ar");
    expect(issue?.message).toBe("admin.categories.form.errors.nameAr");
  });

  it.each(["Rings", "rings & things", "rings_and_things", "-rings", "rings-"])(
    "rejects a malformed slug: %s",
    (slug) => {
      expect(schema.safeParse({ ...validBase, slug }).success).toBe(false);
    },
  );

  it("accepts a slug with multiple hyphenated segments", () => {
    expect(
      schema.safeParse({ ...validBase, slug: "gold-rings-2024" }).success,
    ).toBe(true);
  });

  it("rejects an image over the 4MB limit", () => {
    const oversized = new File([new Uint8Array(4 * 1024 * 1024 + 1)], "big.png");
    const result = schema.safeParse({ ...validBase, image: oversized });
    const issue = result.error?.issues.find((i) => i.path[0] === "image");
    expect(issue?.message).toBe("admin.categories.form.errors.imageSize");
  });

  it("accepts an image exactly at the 4MB limit", () => {
    const atLimit = new File([new Uint8Array(4 * 1024 * 1024)], "ok.png");
    expect(schema.safeParse({ ...validBase, image: atLimit }).success).toBe(true);
  });

  it("accepts a category with the image field omitted entirely", () => {
    const { name_ar, name_en, slug, is_active } = validBase;
    expect(
      schema.safeParse({ name_ar, name_en, slug, is_active }).success,
    ).toBe(true);
  });
});

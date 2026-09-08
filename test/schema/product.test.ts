import { describe, it, expect } from "vitest";
import { getProductSchema } from "@/schema/product";
import { KARAT_OPTIONS } from "@/types/product";
import { fakeT } from "../helpers/fakeT";

const schema = getProductSchema(fakeT);

// Every numeric field arrives as a string, exactly what the DOM's number
// inputs actually produce — the schema's `z.coerce`/`optionalNumber` chains
// exist specifically to turn these back into numbers or `undefined`.
const validBase = {
  category_id: "1",
  slug: "gold-ring",
  name_ar: "خاتم ذهبي",
  name_en: "Gold Ring",
  description_ar: "",
  description_en: "",
  gold_weight: "",
  karat: KARAT_OPTIONS[0],
  gemstone_type: "",
  gemstone_carat: "",
  price: "100",
  has_discount: false,
  discount_value: "",
  stock: "5",
  is_active: true,
};

describe("getProductSchema", () => {
  it("accepts a fully valid submission and coerces numeric strings", () => {
    const result = schema.safeParse(validBase);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe(100);
      expect(result.data.category_id).toBe(1);
      expect(result.data.stock).toBe(5);
      // A blank optional numeric/text input becomes `undefined`, never 0 or
      // "" — the entire reason `optionalNumber`/`optionalText` exist (see
      // the schema's own comment: an empty gold-weight field must not
      // silently save as zero).
      expect(result.data.gold_weight).toBeUndefined();
      expect(result.data.description_ar).toBeUndefined();
    }
  });

  it("rejects a non-positive category_id", () => {
    const result = schema.safeParse({ ...validBase, category_id: "0" });
    const issue = result.error?.issues.find((i) => i.path[0] === "category_id");
    expect(issue?.message).toBe("admin.products.form.errors.category");
  });

  it.each(["Gold-Ring", "gold ring", "gold_ring", "-gold-ring", "gold-ring-"])(
    "rejects a malformed slug: %s",
    (slug) => {
      expect(schema.safeParse({ ...validBase, slug }).success).toBe(false);
    },
  );

  it("rejects a one-character Arabic name", () => {
    const result = schema.safeParse({ ...validBase, name_ar: "خ" });
    const issue = result.error?.issues.find((i) => i.path[0] === "name_ar");
    expect(issue?.message).toBe("admin.products.form.errors.nameAr");
  });

  it("rejects a one-character English name", () => {
    const result = schema.safeParse({ ...validBase, name_en: "G" });
    const issue = result.error?.issues.find((i) => i.path[0] === "name_en");
    expect(issue?.message).toBe("admin.products.form.errors.nameEn");
  });

  it("rejects a zero price", () => {
    const result = schema.safeParse({ ...validBase, price: "0" });
    const issue = result.error?.issues.find((i) => i.path[0] === "price");
    expect(issue?.message).toBe("admin.products.form.errors.price");
  });

  it("rejects negative stock", () => {
    const result = schema.safeParse({ ...validBase, stock: "-1" });
    const issue = result.error?.issues.find((i) => i.path[0] === "stock");
    expect(issue?.message).toBe("admin.products.form.errors.stock");
  });

  it("rejects a negative gold_weight but accepts it left blank", () => {
    expect(schema.safeParse({ ...validBase, gold_weight: "-1" }).success).toBe(
      false,
    );
    expect(schema.safeParse({ ...validBase, gold_weight: "" }).success).toBe(
      true,
    );
  });

  it("rejects a negative gemstone_carat but accepts it left blank", () => {
    expect(
      schema.safeParse({ ...validBase, gemstone_carat: "-1" }).success,
    ).toBe(false);
    expect(
      schema.safeParse({ ...validBase, gemstone_carat: "" }).success,
    ).toBe(true);
  });

  it("rejects a karat outside the API's accepted set", () => {
    expect(schema.safeParse({ ...validBase, karat: "14" }).success).toBe(false);
  });

  it.each(KARAT_OPTIONS)("accepts every documented karat option: %s", (karat) => {
    expect(schema.safeParse({ ...validBase, karat }).success).toBe(true);
  });

  describe("discount rules", () => {
    it("does not require a discount_value when has_discount is off", () => {
      expect(
        schema.safeParse({ ...validBase, has_discount: false, discount_value: "" })
          .success,
      ).toBe(true);
    });

    it("requires a discount_value once has_discount is on", () => {
      const result = schema.safeParse({
        ...validBase,
        has_discount: true,
        discount_value: "",
      });
      const issue = result.error?.issues.find(
        (i) => i.path[0] === "discount_value",
      );
      expect(issue?.message).toBe("admin.products.form.errors.discountRequired");
    });

    it("rejects a zero discount_value when has_discount is on", () => {
      // 0 passes the field's own `.min(0)`, so this specifically exercises
      // the object-level `.refine` requiring a discount to be *positive*,
      // not just non-negative — a switch turned on with nothing behind it
      // would otherwise silently save as "no discount" while looking
      // configured.
      const result = schema.safeParse({
        ...validBase,
        has_discount: true,
        discount_value: "0",
      });
      const issue = result.error?.issues.find(
        (i) => i.path[0] === "discount_value",
      );
      expect(issue?.message).toBe("admin.products.form.errors.discountRequired");
    });

    it("rejects a negative discount_value regardless of has_discount", () => {
      const result = schema.safeParse({
        ...validBase,
        has_discount: true,
        discount_value: "-5",
      });
      const issue = result.error?.issues.find(
        (i) => i.path[0] === "discount_value",
      );
      expect(issue?.message).toBe("admin.products.form.errors.discountValue");
    });

    it("rejects a discount_value over 100 even while has_discount is off", () => {
      // The field's own 0-100 bound applies unconditionally; only the
      // *requiredness* is gated on has_discount, not the range.
      const result = schema.safeParse({
        ...validBase,
        has_discount: false,
        discount_value: "150",
      });
      const issue = result.error?.issues.find(
        (i) => i.path[0] === "discount_value",
      );
      expect(issue?.message).toBe("admin.products.form.errors.discountMax");
    });

    it("accepts exactly 100 as a discount_value", () => {
      // Deliberately allowed per the schema's own comment: giving a piece
      // away entirely is the shop's call, not a rule the form should invent.
      expect(
        schema.safeParse({ ...validBase, has_discount: true, discount_value: "100" })
          .success,
      ).toBe(true);
    });

    it("accepts a normal discount_value when has_discount is on", () => {
      expect(
        schema.safeParse({ ...validBase, has_discount: true, discount_value: "15" })
          .success,
      ).toBe(true);
    });
  });
});

import { describe, it, expect } from "vitest";
import { getEmailSchema, getCodeSchema } from "@/schema/auth";
import { fakeT } from "../helpers/fakeT";

describe("getEmailSchema", () => {
  describe("login (requireName: false)", () => {
    const schema = getEmailSchema(fakeT, false);

    it("accepts a valid email with no name fields", () => {
      expect(schema.safeParse({ email: "a@b.com" }).success).toBe(true);
    });

    it("rejects an invalid email", () => {
      const result = schema.safeParse({ email: "not-an-email" });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe("auth.email.error");
    });

    // requireName is off, so a missing/short name must never block login —
    // asking a returning visitor for their name to sign in makes no sense
    // (see the schema's own comment).
    it("ignores missing names entirely", () => {
      expect(
        schema.safeParse({ email: "a@b.com", firstName: "", lastName: "" })
          .success,
      ).toBe(true);
    });
  });

  describe("register (requireName: true)", () => {
    const schema = getEmailSchema(fakeT, true);

    it("accepts a valid email with both names", () => {
      expect(
        schema.safeParse({
          email: "a@b.com",
          firstName: "Fiez",
          lastName: "Alhag",
        }).success,
      ).toBe(true);
    });

    it("rejects a missing first name", () => {
      const result = schema.safeParse({ email: "a@b.com", lastName: "Alhag" });
      const issue = result.error?.issues.find((i) => i.path[0] === "firstName");
      expect(issue?.message).toBe("auth.name.firstError");
    });

    it("rejects a missing last name", () => {
      const result = schema.safeParse({ email: "a@b.com", firstName: "Fiez" });
      const issue = result.error?.issues.find((i) => i.path[0] === "lastName");
      expect(issue?.message).toBe("auth.name.lastError");
    });

    it("trims whitespace before checking the 2-character minimum", () => {
      // "  A " trims down to a single real character, so it must still fail
      // — padding around one letter isn't a name.
      const result = schema.safeParse({
        email: "a@b.com",
        firstName: "  A ",
        lastName: "Alhag",
      });
      const issue = result.error?.issues.find((i) => i.path[0] === "firstName");
      expect(issue?.message).toBe("auth.name.firstError");
    });

    it("accepts a name exactly at the 2-character minimum", () => {
      expect(
        schema.safeParse({ email: "a@b.com", firstName: "Al", lastName: "Hi" })
          .success,
      ).toBe(true);
    });
  });
});

describe("getCodeSchema", () => {
  const schema = getCodeSchema(fakeT);

  it("accepts a 6-digit code", () => {
    expect(schema.safeParse({ code: "123456" }).success).toBe(true);
  });

  it.each(["12345", "1234567", "12345a", ""])(
    "rejects %s as not exactly 6 digits",
    (code) => {
      const result = schema.safeParse({ code });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe("auth.code.error");
    },
  );
});

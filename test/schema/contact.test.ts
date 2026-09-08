import { describe, it, expect } from "vitest";
import { getContactSchema } from "@/schema/contact";
import { fakeT } from "../helpers/fakeT";

const schema = getContactSchema(fakeT);

const validBase = {
  name: "Fiez Alhag",
  email: "fiez@example.com",
  phone: "+963991234567",
  subject: "Question about a ring",
  message: "I'd like to know more about the eternity ring.",
};

describe("getContactSchema", () => {
  it("accepts a fully valid submission", () => {
    expect(schema.safeParse(validBase).success).toBe(true);
  });

  it("rejects a name shorter than 2 characters", () => {
    expect(schema.safeParse({ ...validBase, name: "F" }).success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = schema.safeParse({ ...validBase, email: "not-an-email" });
    const issue = result.error?.issues.find((i) => i.path[0] === "email");
    expect(issue?.message).toBe("contact.form.errors.email");
  });

  it.each(["123", "abcdefg", ""])("rejects an invalid phone: %s", (phone) => {
    expect(schema.safeParse({ ...validBase, phone }).success).toBe(false);
  });

  it.each(["0501234567", "+1 555 123 4567", "05-01-234-567"])(
    "accepts common real-world phone formats: %s",
    (phone) => {
      expect(schema.safeParse({ ...validBase, phone }).success).toBe(true);
    },
  );

  it("rejects a subject shorter than 2 characters", () => {
    expect(schema.safeParse({ ...validBase, subject: "A" }).success).toBe(false);
  });

  it("rejects a message shorter than 10 characters", () => {
    expect(
      schema.safeParse({ ...validBase, message: "too short" }).success,
    ).toBe(false);
  });

  it("accepts a message exactly at the 10-character minimum", () => {
    expect(
      schema.safeParse({ ...validBase, message: "0123456789" }).success,
    ).toBe(true);
  });
});

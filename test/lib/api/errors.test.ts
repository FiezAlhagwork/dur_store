import { describe, it, expect } from "vitest";
import { ApiError, toApiError } from "@/lib/api/errors";

describe("ApiError", () => {
  it("stores status, message, and errors, and is a real Error", () => {
    const error = new ApiError(422, "Validation failed", {
      email: ["Email is required"],
    });

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("ApiError");
    expect(error.status).toBe(422);
    expect(error.message).toBe("Validation failed");
    expect(error.errors).toEqual({ email: ["Email is required"] });
  });

  describe("isValidation", () => {
    it("is true only for 422", () => {
      expect(new ApiError(422, "x").isValidation).toBe(true);
      expect(new ApiError(400, "x").isValidation).toBe(false);
      expect(new ApiError(500, "x").isValidation).toBe(false);
    });
  });

  describe("isForbidden", () => {
    it("is true only for 403", () => {
      // Branches on the status alone, never the message — this app's own
      // API is documented (see the getter's comment) to send 404-sounding
      // text on a 403, which is exactly the trap this guards against.
      expect(new ApiError(403, "The requested resource was not found.").isForbidden).toBe(
        true,
      );
      expect(new ApiError(404, "Not found").isForbidden).toBe(false);
    });
  });

  describe("fieldError", () => {
    it("returns the first message for a field that has one", () => {
      const error = new ApiError(422, "Validation failed", {
        email: ["Email is required", "Email must be valid"],
      });
      expect(error.fieldError("email")).toBe("Email is required");
    });

    it("returns undefined for a field with no errors", () => {
      const error = new ApiError(422, "Validation failed", {
        email: ["Email is required"],
      });
      expect(error.fieldError("password")).toBeUndefined();
    });

    it("returns undefined when there are no errors at all (not a 422)", () => {
      const error = new ApiError(500, "Server error");
      expect(error.fieldError("email")).toBeUndefined();
    });
  });
});

describe("toApiError", () => {
  it("passes an existing ApiError through unchanged", () => {
    const original = new ApiError(403, "Forbidden");
    expect(toApiError(original)).toBe(original);
  });

  it("builds an ApiError from an axios error that has a response", () => {
    const axiosError = {
      isAxiosError: true,
      message: "Request failed with status code 422",
      response: {
        status: 422,
        data: {
          message: "The given data was invalid.",
          errors: { email: ["Email is required"] },
        },
      },
    };

    const result = toApiError(axiosError);
    expect(result.status).toBe(422);
    expect(result.message).toBe("The given data was invalid.");
    expect(result.errors).toEqual({ email: ["Email is required"] });
  });

  it("falls back to the axios message when the response body has none", () => {
    const axiosError = {
      isAxiosError: true,
      message: "Request failed with status code 500",
      response: { status: 500, data: {} },
    };

    expect(toApiError(axiosError).message).toBe(
      "Request failed with status code 500",
    );
  });

  it("falls back to a generated message when neither the body nor axios has one", () => {
    const axiosError = {
      isAxiosError: true,
      message: "",
      response: { status: 500, data: {} },
    };

    expect(toApiError(axiosError).message).toBe("Request failed with status 500");
  });

  it("uses status 0 for an axios error with no response at all", () => {
    // Deliberately distinct from any real HTTP status (per the function's
    // own comment), so the retry policy can treat it as retryable without
    // ever confusing it for a 401.
    const axiosError = {
      isAxiosError: true,
      message: "Network Error",
      response: undefined,
    };

    const result = toApiError(axiosError);
    expect(result.status).toBe(0);
    expect(result.message).toBe("Network Error");
  });

  it("falls back to a generic message for a response-less axios error with no message", () => {
    const axiosError = { isAxiosError: true, message: "", response: undefined };
    expect(toApiError(axiosError).message).toBe("Network request failed");
  });

  it("wraps a plain Error as status 0 with its own message", () => {
    const result = toApiError(new Error("boom"));
    expect(result.status).toBe(0);
    expect(result.message).toBe("boom");
  });

  it("wraps a completely unknown thrown value as a generic error", () => {
    expect(toApiError("just a string").message).toBe("Unknown error");
    expect(toApiError(undefined).message).toBe("Unknown error");
  });
});

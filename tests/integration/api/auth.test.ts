import { describe, it, expect, vi, beforeEach } from "vitest";
import { hashPassword, verifyPassword, sanitizeEmail, sanitizeName } from "@/lib/password";

describe("Auth Library", () => {
  describe("hashPassword", () => {
    it("should hash a password into bcrypt format", async () => {
      const password = "TestPassword123!";
      const hash = await hashPassword(password);

      expect(hash).toMatch(/^\$2[aby]?\$\d{1,2}\$.{53}$/);
      expect(hash).not.toBe(password);
    });

    it("should produce different hashes for same password (salt)", async () => {
      const password = "SamePassword123!";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("verifyPassword", () => {
    it("should return true for correct password", async () => {
      const password = "CorrectPassword123!";
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it("should return false for incorrect password", async () => {
      const hash = await hashPassword("CorrectPassword123!");

      const isValid = await verifyPassword("WrongPassword456!", hash);

      expect(isValid).toBe(false);
    });

    it("should return false for malformed hash", async () => {
      const isValid = await verifyPassword("password", "not-a-hash");

      expect(isValid).toBe(false);
    });
  });

  describe("sanitizeEmail", () => {
    it("should convert email to lowercase", () => {
      expect(sanitizeEmail("Test@EXAMPLE.COM")).toBe("test@example.com");
    });

    it("should trim whitespace", () => {
      expect(sanitizeEmail("  user@example.com  ")).toBe("user@example.com");
    });

    it("should handle null/undefined", () => {
      expect(sanitizeEmail(null)).toBe("");
      expect(sanitizeEmail(undefined)).toBe("");
    });
  });

  describe("sanitizeName", () => {
    it("should trim whitespace", () => {
      expect(sanitizeName("  John Doe  ")).toBe("John Doe");
    });

    it("should remove HTML tags", () => {
      expect(sanitizeName("<script>alert('xss')</script>John")).toBe("alert('xss')John");
    });

    it("should collapse multiple spaces", () => {
      expect(sanitizeName("John    Doe")).toBe("John Doe");
    });

    it("should handle null/undefined", () => {
      expect(sanitizeName(null)).toBe("");
      expect(sanitizeName(undefined)).toBe("");
    });
  });
});

describe("Registration API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should validate registration data schema", async () => {
    const { registerSchema } = await import("@/lib/validation");

    const validData = {
      email: "test@example.com",
      password: "Password123",
      name: "Test User",
      phone: "+355 69 123 4567",
    };

    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", async () => {
    const { registerSchema } = await import("@/lib/validation");

    const invalidData = {
      email: "not-an-email",
      password: "Password123",
      name: "Test User",
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should reject short password", async () => {
    const { registerSchema } = await import("@/lib/validation");

    const invalidData = {
      email: "test@example.com",
      password: "short",
      name: "Test User",
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should accept valid Albanian phone number", async () => {
    const { registerSchema } = await import("@/lib/validation");

    const validData = {
      email: "test@example.com",
      password: "Password123",
      name: "Test User",
      phone: "+355 69 123 4567",
    };

    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject invalid Albanian phone number", async () => {
    const { registerSchema } = await import("@/lib/validation");

    const invalidData = {
      email: "test@example.com",
      password: "Password123",
      name: "Test User",
      phone: "+1 555 123 4567",
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe("Login API", () => {
  it("should validate login data schema", async () => {
    const { loginSchema } = await import("@/lib/validation");

    const validData = {
      email: "test@example.com",
      password: "anypassword",
    };

    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject empty password", async () => {
    const { loginSchema } = await import("@/lib/validation");

    const invalidData = {
      email: "test@example.com",
      password: "",
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

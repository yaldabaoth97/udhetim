import bcrypt from "bcryptjs";

// OWASP recommends minimum 12 rounds for bcrypt
const BCRYPT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch {
    return false;
  }
}

export function sanitizeEmail(email: string | null | undefined): string {
  if (!email) return "";
  return email.toLowerCase().trim();
}

export function sanitizeName(name: string | null | undefined): string {
  if (!name) return "";
  return name
    .trim()
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ");
}

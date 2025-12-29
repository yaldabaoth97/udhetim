import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, sanitizeEmail, sanitizeName } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password, name, phone, locale } = parsed.data;
    const normalizedEmail = sanitizeEmail(email);
    const sanitizedName = sanitizeName(name);

    // Hash password first to prevent timing attacks
    // This ensures consistent response time whether email exists or not
    const passwordHash = await hashPassword(password);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: sanitizedName,
        phone: phone || null,
        locale: locale || "sq",
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        locale: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}

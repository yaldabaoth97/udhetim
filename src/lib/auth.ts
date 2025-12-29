import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { loginSchema } from "./validation";
import { verifyPassword, sanitizeEmail } from "./password";

export { hashPassword, verifyPassword, sanitizeEmail, sanitizeName } from "./password";

const authConfig: NextAuthConfig = {
  // No adapter needed - we use credentials provider with JWT sessions
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          console.warn("[AUTH] Login attempt with invalid credentials format");
          return null;
        }

        const { email, password } = parsed.data;
        const normalizedEmail = sanitizeEmail(email);

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user) {
          // Log but mask email for privacy
          console.warn(`[AUTH] Login attempt for non-existent email: ${normalizedEmail.substring(0, 3)}***`);
          return null;
        }

        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) {
          console.warn(`[AUTH] Failed login attempt for user: ${user.id}`);
          return null;
        }

        console.info(`[AUTH] Successful login for user: ${user.id}`);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);

export { authConfig };

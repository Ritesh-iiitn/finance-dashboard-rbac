import NextAuth, { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { z } from "zod";

export const authOptions: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const parsedCredentials = z
            .object({ email: z.string().email(), password: z.string().min(6) })
            .safeParse(credentials);

          if (!parsedCredentials.success) {
            if (process.env.NODE_ENV !== "production") {
              console.error("[auth] Invalid credential payload", parsedCredentials.error.flatten());
            }
            return null;
          }

          const normalizedEmail = parsedCredentials.data.email.trim().toLowerCase();
          const password = parsedCredentials.data.password;
          const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

          if (!user) {
            if (process.env.NODE_ENV !== "production") console.error("[auth] User not found", { email: normalizedEmail });
            return null;
          }

          if (user.status !== "ACTIVE") {
            if (process.env.NODE_ENV !== "production") console.error("[auth] User is not active", { email: normalizedEmail, status: user.status });
            return null;
          }

          // Guard against malformed hashes from manual SQL inserts.
          const storedHash = (user.password ?? "").trim();
          const looksLikeBcryptHash = /^\$2[aby]\$\d{2}\$/.test(storedHash);
          if (!looksLikeBcryptHash) {
            if (process.env.NODE_ENV !== "production") {
              console.error("[auth] Stored password is not a valid bcrypt hash prefix", {
                email: normalizedEmail,
                hashPrefix: storedHash.slice(0, 8),
                hashLength: storedHash.length,
              });
            }
            return null;
          }

          const passwordsMatch = await bcrypt.compare(password, storedHash);
          if (!passwordsMatch) {
            if (process.env.NODE_ENV !== "production") {
              console.error("[auth] Password comparison failed", { email: normalizedEmail });
            }
            return null;
          }

          return { id: user.id, name: user.name, email: user.email, role: user.role };
        } catch (error) {
          if (process.env.NODE_ENV !== "production") {
            console.error("[auth] authorize() failed with exception", error);
          }
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" }
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

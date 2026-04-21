import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      avatarHue: number;
    } & DefaultSession["user"];
  }
}

const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { auth, handlers, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (raw) => {
        const parsed = CredentialsSchema.safeParse(raw);
        if (!parsed.success) {
          console.warn("[auth] credentials failed zod validation");
          return null;
        }
        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          console.warn(`[auth] no user found for email: ${email}`);
          return null;
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
          console.warn(`[auth] bad password for: ${email}`);
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatarHue: user.avatarHue,
        };
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        const u = user as { id?: string; role: UserRole; avatarHue: number };
        (token as Record<string, unknown>).id = u.id;
        (token as Record<string, unknown>).role = u.role;
        (token as Record<string, unknown>).avatarHue = u.avatarHue;
      }
      return token;
    },
    session: ({ session, token }) => {
      const t = token as Record<string, unknown>;
      if (typeof t.id === "string") session.user.id = t.id;
      if (typeof t.role === "string") session.user.role = t.role as UserRole;
      if (typeof t.avatarHue === "number") session.user.avatarHue = t.avatarHue;
      return session;
    },
  },
});

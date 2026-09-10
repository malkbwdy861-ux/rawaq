import NextAuth, { AuthError } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/server/db/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/dashboard/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const admin = await prisma.adminUser.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
          select: {
            id: true,
            email: true,
            name: true,
            passwordHash: true,
          },
        });

        if (!admin) {
          return null;
        }

        const passwordMatches = await compare(
          parsed.data.password,
          admin.passwordHash,
        );

        if (!passwordMatches) {
          return null;
        }

        await prisma.adminUser.update({
          where: { id: admin.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: admin.id,
          email: admin.email,
          name: admin.name,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.adminUserId = user.id;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user && token.adminUserId) {
        session.user.id = token.adminUserId as string;
      }

      return session;
    },
  },
});

export async function getAdminSession() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return session;
}

export async function requireAdmin() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/dashboard/login");
  }

  return session;
}

export function isAuthCredentialsError(error: unknown) {
  return error instanceof AuthError && error.type === "CredentialsSignin";
}

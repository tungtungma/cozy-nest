import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    // JWT callback: Inject user role into the token for middleware access
    jwt: async ({ token, user, trigger }) => {
      // On sign-in or update, fetch the latest user data from database
      if (user) {
        token.id = user.id;
        token.role = user.role || "pending";
        token.tier = user.tier || "member";
      } else if (trigger === "update" || !token.role) {
        // Refresh user data from database if token doesn't have role
        // or when session is updated
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, tier: true, approvedAt: true },
        });
        if (dbUser) {
          token.role = dbUser.role || "pending";
          token.tier = dbUser.tier || "member";
        }
      }
      return token;
    },
    session: async ({ session, token }) => {
      // JWT Strategy: Use token data (from jwt callback) instead of database
      // This is required for Edge middleware to read the session
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || "pending";
        // VIP Tier: Add tier information to session from token
        session.user.tier = (token.tier as string) || "member";
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (!user.email) return true;

      // Check if user is in the whitelist
      const allowedEmails = process.env.ALLOWED_MEMBER_EMAILS?.split(',').map(e => e.trim()) || [];
      const isWhitelisted = allowedEmails.includes(user.email);

      // Find or create user
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (existingUser) {
        // If whitelisted but not yet a member, auto-approve
        if (isWhitelisted && existingUser.role === "pending") {
          await prisma.user.update({
            where: { email: user.email },
            data: {
              role: "member",
              approvedAt: new Date(),
              approvedBy: "auto-whitelist",
            },
          });
        }
      } else if (isWhitelisted) {
        // New user on whitelist - will be created by adapter with role "member"
        // Note: This happens after signIn callback, so we'll update in session callback
      }

      return true;
    },
  },
  session: {
    strategy: "jwt", // REQUIRED: JWT strategy for Edge middleware to read sessions
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  events: {
    createUser: async ({ user }) => {
      // Check whitelist for new users
      const allowedEmails = process.env.ALLOWED_MEMBER_EMAILS?.split(',').map(e => e.trim()) || [];
      if (user.email && allowedEmails.includes(user.email)) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            role: "member",
            approvedAt: new Date(),
            approvedBy: "auto-whitelist",
          },
        });
      }
    },
  },
});

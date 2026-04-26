import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/gmail.modify",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              googleId: account?.providerAccountId || profile?.sub,
              refreshToken: account?.refresh_token,
              accessToken: account?.access_token,
              tokenExpiry: account?.expires_at ? new Date(account.expires_at * 1000) : null,
            },
          });
        } else {
          await prisma.user.update({
            where: { email: user.email },
            data: {
              refreshToken: account?.refresh_token,
              accessToken: account?.access_token,
              tokenExpiry: account?.expires_at ? new Date(account.expires_at * 1000) : null,
            },
          });
        }
        return true;
      } catch (error) {
        console.error("SignIn error:", error);
        return true;
      }
    },
    async redirect({ url, baseUrl }) {
      // Allow redirect to frontend (localhost:5173)
      if (url.startsWith('http://localhost:5173')) return url;
      // If relative URL, prepend frontend URL
      if (url.startsWith('/')) return `http://localhost:5173${url}`;
      // Fallback to frontend
      return 'http://localhost:5173';
    },
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.providerAccountId = account.providerAccountId;
      }
      if (user) {
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.user.id = token.sub || token.providerAccountId;
      return session;
    },
  },
  session: { strategy: "jwt" },
  debug: true,
};
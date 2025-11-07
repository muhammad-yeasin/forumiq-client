/* eslint-disable @typescript-eslint/no-explicit-any */
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import { env } from "@/config/env";

export const authOptions: NextAuthOptions = {
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "Email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const res = await fetch(env.API_BASE_URL + "/auth/signin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        });

        const user = await res.json();
        // console.log("user", user);
        if (!res.ok) {
          // console.log("error");
          throw new Error(JSON.stringify({ ...user, statusCode: res.status }));
        }
        return user?.data || null;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update") {
        token.user = session.user;
        return token;
      }
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.user = (user as any).user;
        token.tokenExp = (user as any).exp;
      }
      return token;
    },
    async session({ session, token }) {
      const currentTime = Math.floor(Date.now() / 1000);
      if (token.tokenExp && (token.tokenExp as number) < currentTime) {
        throw new Error("Token expired");
      }
      (session as any).accessToken = token.accessToken;
      (session as any).user = token.user;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

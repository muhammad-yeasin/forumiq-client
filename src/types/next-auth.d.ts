/* eslint-disable @typescript-eslint/no-unused-vars */
import { Role } from "@/redux/features/auth/auth-slice";
import NextAuth from "next-auth/next";

declare module "next-auth" {
  interface Session {
    user: {
      role: Role;
      username: string;
      _id: string;
      email: string;
      avatar: string;
    };
    accessToken: string;
  }
}

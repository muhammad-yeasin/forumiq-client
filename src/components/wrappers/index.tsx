"use client";
/* eslint-disable react-hooks/exhaustive-deps */

import { login } from "@/redux/features/auth/auth-slice";
import { useAppDispatch } from "@/redux/hooks";
import { useSession } from "next-auth/react";
import { useLayoutEffect } from "react";

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const dispatch = useAppDispatch();

  useLayoutEffect(() => {
    if (status !== "loading") {
      dispatch(
        login({
          user: {
            role: session?.user?.role ?? "user",
            username: session?.user?.username ?? null,
            avatar: session?.user?.avatar ?? null,
            _id: session?.user?._id ?? null,
            email: session?.user?.email ?? null,
          },
          accessToken: session?.accessToken ?? null,
          status,
        })
      );
    }
  }, [session, status]);

  return children;
};

export default Wrapper;

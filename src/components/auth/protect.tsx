"use client";

import { useAppSelector } from "@/redux/hooks";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = (props) => {
  const { children } = props;
  const router = useRouter();

  const { status } = useAppSelector((state) => state.auth);
  const pathname = usePathname();

  if (status === "unauthenticated") {
    router.replace("/login");
    if (typeof window !== "undefined") {
      localStorage.setItem("redirectUrl", pathname);
    }
    return null;
  }
  if (status === "authenticated") return children;
};

export default ProtectedRoute;

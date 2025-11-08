"use client";
import { SessionProvider } from "next-auth/react";
import React from "react";
import ReduxProvider from "./redux-provider";
import { SocketProvider } from "./socket-provider";

const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <ReduxProvider>
        <SocketProvider>{children}</SocketProvider>
      </ReduxProvider>
    </SessionProvider>
  );
};

export default Provider;

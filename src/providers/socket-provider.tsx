"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { env } from "@/config/env";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket] = useState<Socket>(() => {
    // Extract base URL without /api/v1 for socket connection
    const socketUrl = env.API_BASE_URL.replace("/api/v1", "");
    return io(socketUrl, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });
  });

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const handleConnect = () => {
      console.log("Socket connected:", socket.id);
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    };

    const handleConnectError = (error: Error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell } from "lucide-react";
import { formatDistance } from "date-fns";
import { useState, useEffect } from "react";
import {
  useGetNotificationsQuery,
  Notification,
} from "@/redux/features/notifications/notifications-api";
import { useSocket } from "@/providers/socket-provider";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
export default function NotificationMenu() {
  const [notifPage, setNotifPage] = useState(1);
  const notifLimit = 10;
  const { data: session } = useSession();
  const userId = session?.user?._id;
  const { socket } = useSocket();
  const [realtimeNotifications, setRealtimeNotifications] = useState<
    Notification[]
  >([]);
  const [hasNew, setHasNew] = useState(false);
  const {
    data: notifData,
    isLoading: notifLoading,
    isFetching: notifFetching,
    refetch,
  } = useGetNotificationsQuery({ page: notifPage, limit: notifLimit });
  const pagination = notifData?.pagination;
  const apiNotifications = notifData?.data?.notifications || [];
  const notifications = [
    ...realtimeNotifications,
    ...apiNotifications.filter(
      (n) => !realtimeNotifications.some((rn) => rn._id === n._id)
    ),
  ];

  useEffect(() => {
    if (!socket || !userId) return;
    socket.emit("join-user", userId);
    return () => {
      socket.emit("leave-user", userId);
    };
  }, [socket, userId]);

  useEffect(() => {
    if (!socket || !userId) return;
    const handleNewNotification = (notification: Notification) => {
      setRealtimeNotifications((prev: Notification[]) => {
        if (prev.some((n) => n._id === notification._id)) return prev;
        return [notification, ...prev];
      });
      setHasNew(true);
      refetch(); // Ensure notifications are synced with backend
    };
    socket.on("new-notification", handleNewNotification);
    return () => {
      socket.off("new-notification", handleNewNotification);
    };
  }, [socket, userId, refetch]);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative p-2"
          onClick={() => setHasNew(false)}
        >
          <Bell className="h-6 w-6" />
          {(hasNew || notifications.some((n) => !n.isRead)) && (
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="py-2 px-2">
          <div className="font-semibold text-base mb-2">Notifications</div>
        </div>
        <div className="max-h-80 overflow-y-auto px-2 pb-2">
          {notifLoading || notifFetching ? (
            <div className="py-6 text-center text-muted-foreground text-sm">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground text-sm">
              No notifications found.
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 shadow-sm transition-colors cursor-pointer
                    ${notif.isRead ? "bg-muted" : "bg-primary/5"}
                  `}
                >
                  <div className="shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    {notif.message[0]?.toUpperCase() || "N"}
                  </div>
                  <div>
                    <span className="font-medium text-foreground line-clamp-2">
                      {notif.message}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistance(new Date(notif.createdAt), new Date(), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {pagination?.hasNextPage && (
          <div className="pt-2 pb-2 flex justify-center border-t border-border bg-card">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setNotifPage((p) => p + 1)}
              disabled={notifFetching}
            >
              {notifFetching ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

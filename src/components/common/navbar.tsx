"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Notification from "./notification";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [query, setQuery] = useState<string>(
    (searchParams?.get("q") as string) || ""
  );

  // Keep input synced when url changes externally
  useEffect(() => {
    const urlQ = (searchParams?.get("q") as string) || "";
    if (urlQ !== query) {
      const t = window.setTimeout(() => setQuery(urlQ), 0);
      return () => window.clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const updateUrlQuery = (value: string) => {
    const params = new URLSearchParams(window.location.search ?? "");
    if (value && value.trim() !== "") {
      params.set("q", value.trim());
    } else {
      params.delete("q");
    }
    const search = params.toString();
    const to = search ? `${pathname}?${search}` : `${pathname}`;
    void router.replace(to);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // Prevent form submission if inside a form
      e.preventDefault();
      updateUrlQuery(query);
    }
  };

  const handleLogout = () => {
    signOut({
      redirect: true,
      callbackUrl: "/",
    });
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="shrink-0">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-foreground"
          >
            ForumIQ
          </Link>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md">
          <Input
            type="search"
            placeholder="Search threads…"
            className="w-full bg-muted"
            value={query}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
          />
        </div>
        {session ? (
          <div className="flex items-center gap-2">
            {/* Notification Dropdown */}
            <Notification />
            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {session.user.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile">My Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 cursor-pointer"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <>
            <Link href="/login">
              <Button
                variant="outline"
                className="text-foreground bg-transparent"
              >
                Login
              </Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

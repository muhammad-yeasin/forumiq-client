"use client";

import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="shrink-0">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            ForumIQ
          </h1>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md">
          <Input
            type="search"
            placeholder="Search threads…"
            className="w-full bg-muted"
          />
        </div>

        {/* Avatar */}
        <div className="flex-shrink-0">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              U
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </nav>
  );
}

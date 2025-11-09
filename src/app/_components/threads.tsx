/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import ThreadCard from "./thread-card";
import {
  useGetThreadsQuery,
  Thread,
} from "@/redux/features/threads/threads-api";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Threads() {
  const [page, setPage] = useState(1);
  const [threads, setThreads] = useState<Thread[]>([]);

  const searchParams = useSearchParams();
  const search = (searchParams?.get("q") as string) || "";

  const limit = 10;
  const { data, isLoading, isFetching } = useGetThreadsQuery({
    page,
    limit,
    search,
  });
  // Reset threads when search changes
  useEffect(() => {
    setPage(1);
    setThreads([]);
  }, [search]);

  // Append or replace threads when data arrives
  useEffect(() => {
    const incoming = data?.data?.threads || [];

    if (page === 1) {
      setThreads(incoming);
    } else if (incoming.length > 0) {
      // Append only new threads (prevent duplicates)
      setThreads((prev) => {
        const existingIds = new Set(prev.map((t) => t._id));
        const filtered = incoming.filter((t) => !existingIds.has(t._id));
        return [...prev, ...filtered];
      });
    }
  }, [data, page]);

  // Show initial loading state
  if (isLoading && page === 1) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show empty state
  if (!isLoading && threads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg text-muted-foreground">No threads found.</p>
        <p className="text-sm text-muted-foreground">
          Be the first to create a thread!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {threads.map((thread) => (
        <ThreadCard
          key={thread._id}
          id={thread._id}
          title={thread.title}
          createdAt={thread.createdAt}
          author={thread.user.username}
        />
      ))}

      {/* Loading spinner for page fetch */}
      {isFetching && (
        <div className="py-4 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {/* Load more button when API indicates there's a next page */}
      {data?.pagination?.hasNextPage && (
        <div className="py-4 flex items-center justify-center">
          <Button onClick={() => setPage((p) => p + 1)} disabled={isFetching}>
            {isFetching ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}

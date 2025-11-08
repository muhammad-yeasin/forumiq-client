"use client";

import { useEffect, useState, useReducer } from "react";
import ThreadCard from "./thread-card";
import {
  useGetThreadsQuery,
  Thread,
} from "@/redux/features/threads/threads-api";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

type ThreadsState = {
  threadPages: Record<number, Thread[]>;
  hasMore: boolean;
};

type ThreadsAction =
  | { type: "ADD_PAGE"; page: number; threads: Thread[] }
  | { type: "SET_HAS_MORE"; hasMore: boolean }
  | { type: "RESET" };

function threadsReducer(
  state: ThreadsState,
  action: ThreadsAction
): ThreadsState {
  switch (action.type) {
    case "ADD_PAGE":
      // Ignore duplicate page inserts (prevents overwriting / duplicate fetches)
      if (state.threadPages[action.page]) return state;
      return {
        ...state,
        threadPages: {
          ...state.threadPages,
          [action.page]: action.threads,
        },
      };
    case "SET_HAS_MORE":
      return {
        ...state,
        hasMore: action.hasMore,
      };
    case "RESET":
      return {
        threadPages: {},
        hasMore: true,
      };
    default:
      return state;
  }
}

export default function Threads() {
  const [page, setPage] = useState(1);
  const [state, dispatch] = useReducer(threadsReducer, {
    threadPages: {},
    hasMore: true,
  });

  const searchParams = useSearchParams();
  const search = (searchParams?.get("q") as string) || "";

  const limit = 10;
  const { data, isLoading, isFetching } = useGetThreadsQuery(
    { page, limit, search },
    { skip: !state.hasMore && page > 1 }
  );

  // Aggregate all threads from all pages in order, deduplicating by _id
  const allThreads: Thread[] = [];
  {
    const seen = new Set<string>();
    const pageNums = Object.keys(state.threadPages)
      .map((k) => Number(k))
      .sort((a, b) => a - b);
    for (const p of pageNums) {
      const pageThreads = state.threadPages[p] ?? [];
      for (const t of pageThreads) {
        if (!seen.has(t._id)) {
          seen.add(t._id);
          allThreads.push(t);
        }
      }
    }
  }

  // Update threads and pagination info when data changes
  useEffect(() => {
    if (data?.data?.threads && data.data.threads.length > 0) {
      dispatch({ type: "ADD_PAGE", page, threads: data.data.threads });
      dispatch({
        type: "SET_HAS_MORE",
        hasMore: data.pagination?.hasNextPage ?? false,
      });
    } else if (data?.data?.threads && data.data.threads.length === 0) {
      dispatch({ type: "SET_HAS_MORE", hasMore: false });
    }
  }, [data, page]);

  // Reset pagination when search changes
  useEffect(() => {
    // Schedule microtask reset to avoid sync setState in effect lint warning while
    // still keeping behavior effectively immediate for the next render.
    const id = window.setTimeout(() => {
      setPage(1);
      dispatch({ type: "RESET" });
    }, 0);
    return () => window.clearTimeout(id);
  }, [search]);

  // Infinite scroll using window scroll position
  useEffect(() => {
    if (!state.hasMore || isFetching) return;
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const fullHeight = document.body.offsetHeight;
      // If user is within 200px of the bottom, fetch next page
      if (
        fullHeight - (scrollY + viewportHeight) < 200 &&
        !isFetching &&
        state.hasMore
      ) {
        setPage((prev) => prev + 1);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isFetching, state.hasMore]);

  // Show initial loading state
  if (isLoading && page === 1) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show empty state
  if (!isLoading && allThreads.length === 0) {
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
      {allThreads.map((thread) => (
        <ThreadCard
          key={thread._id}
          id={thread._id}
          title={thread.title}
          createdAt={thread.createdAt}
          author={thread.user.username}
        />
      ))}

      {/* Loading spinner for infinite scroll */}
      {isFetching && (
        <div className="py-4 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
      {/* End message */}
      {!state.hasMore && allThreads.length > 0 && (
        <div className="py-4">
          <p className="text-center text-sm text-muted-foreground">
            No more threads to load
          </p>
        </div>
      )}
    </div>
  );
}

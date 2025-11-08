"use client";

import { useEffect, useState, useReducer } from "react";
import ThreadCard from "./thread-card";
import {
  useGetThreadsQuery,
  Thread,
} from "@/redux/features/threads/threads-api";
import { Loader2 } from "lucide-react";

type ThreadsState = {
  threadPages: Record<number, Thread[]>;
  hasMore: boolean;
};

type ThreadsAction =
  | { type: "ADD_PAGE"; page: number; threads: Thread[] }
  | { type: "SET_HAS_MORE"; hasMore: boolean };

function threadsReducer(
  state: ThreadsState,
  action: ThreadsAction
): ThreadsState {
  switch (action.type) {
    case "ADD_PAGE":
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

  const limit = 10;
  const { data, isLoading, isFetching } = useGetThreadsQuery(
    { page, limit },
    { skip: !state.hasMore && page > 1 }
  );

  // Aggregate all threads from all pages
  const allThreads = Object.keys(state.threadPages)
    .sort((a, b) => Number(a) - Number(b))
    .flatMap((pageNum) => state.threadPages[Number(pageNum)]);

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

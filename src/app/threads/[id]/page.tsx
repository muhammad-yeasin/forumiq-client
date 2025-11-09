"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Clock, User } from "lucide-react";
import { formatDistance } from "date-fns";
import { useGetSingleThreadQuery } from "@/redux/features/threads/threads-api";
import {
  useGetPostsQuery,
  useCreatePostMutation,
  Post,
} from "@/redux/features/posts/posts-api";
import { toast } from "sonner";
import PostCard from "./_components/post-card";
import { useSocket } from "@/providers/socket-provider";
import { env } from "@/config/env";
import ThreadSummary from "./_components/thread-summary";

export default function ThreadDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const threadId = params.id as string;
  const { socket, isConnected } = useSocket();

  const [replyContent, setReplyContent] = useState("");
  const [realTimePosts, setRealTimePosts] = useState<Post[]>([]);

  const { data: threadData, isLoading: threadLoading } =
    useGetSingleThreadQuery(threadId);
  const { data: postsData, isLoading: postsLoading } =
    useGetPostsQuery(threadId);
  const [createPost, { isLoading: isCreatingPost }] = useCreatePostMutation();

  const thread = threadData?.data?.thread;

  const posts = useMemo(() => {
    return postsData?.data?.posts || [];
  }, [postsData?.data?.posts]);

  // Helper function to integrate real-time posts into nested structure
  const integrateRealTimePosts = (
    basePosts: Post[],
    rtPosts: Post[]
  ): Post[] => {
    // Nothing to do
    if (rtPosts.length === 0) return basePosts;

    // Create a deep copy of base posts to avoid mutation
    const result = JSON.parse(JSON.stringify(basePosts)) as Post[];

    // Create a map for quick lookup
    const postMap = new Map<string, Post>();

    const addToMap = (post: Post) => {
      postMap.set(post._id, post);
      if (post.children) {
        post.children.forEach(addToMap);
      }
    };

    result.forEach(addToMap);

    // Apply each real-time post either as an update (if it exists)
    // or as a new post (insert under parent or as root).
    rtPosts.forEach((rtPost) => {
      const existing = postMap.get(rtPost._id);
      if (existing) {
        // Update selective fields on existing node
        existing.content = rtPost.content;
        existing.updatedAt = rtPost.updatedAt;
        existing.moderation = rtPost.moderation || existing.moderation;
        // Update user info if provided
        if (rtPost.user) {
          existing.user = rtPost.user;
        }
      } else {
        // Insert new post
        if (rtPost.parent) {
          const parent = postMap.get(rtPost.parent);
          if (parent) {
            if (!parent.children) parent.children = [];
            const rtPostCopy = { ...rtPost, children: [] };
            parent.children.push(rtPostCopy);
            postMap.set(rtPostCopy._id, rtPostCopy);
          } else {
            const rtPostCopy = { ...rtPost, children: [] };
            result.push(rtPostCopy);
            postMap.set(rtPostCopy._id, rtPostCopy);
          }
        } else {
          const rtPostCopy = { ...rtPost, children: [] };
          result.push(rtPostCopy);
          postMap.set(rtPostCopy._id, rtPostCopy);
        }
      }
    });

    return result;
  };

  const allPosts = useMemo(() => {
    return integrateRealTimePosts(posts, realTimePosts);
  }, [posts, realTimePosts]);

  useEffect(() => {
    if (!socket || !threadId) return;

    socket.emit("join-thread", threadId);

    const handleNewPost = (newPost: Post) => {
      setRealTimePosts((prev) => {
        // Check if already exists in real-time posts or fetched posts
        const existsInRealTime = prev.some((p) => p._id === newPost._id);
        const existsInFetched = posts.some((p) => {
          // Check recursively in the tree
          const checkInTree = (post: Post): boolean => {
            if (post._id === newPost._id) return true;
            if (post.children) {
              return post.children.some(checkInTree);
            }
            return false;
          };
          return checkInTree(p);
        });

        if (existsInRealTime || existsInFetched) return prev;

        // Only show toast for posts from other users
        // toast.success("New reply received!");
        return [...prev, newPost];
      });
    };

    socket.on("new-post", handleNewPost);

    const handleUpdatedPost = (updatedPost: Post) => {
      setRealTimePosts((prev) => {
        // If we already have this post in real-time buffer, replace it
        const exists = prev.some((p) => p._id === updatedPost._id);
        if (exists) {
          return prev.map((p) => (p._id === updatedPost._id ? updatedPost : p));
        }

        // If not present in real-time buffer, add it so integrateRealTimePosts
        // can apply the update on top of fetched posts.
        return [...prev, updatedPost];
      });
    };

    socket.on("update-post", handleUpdatedPost);

    return () => {
      socket.emit("leave-thread", threadId);
      socket.off("new-post", handleNewPost);
      socket.off("update-post", handleUpdatedPost);
    };
  }, [socket, threadId, posts]);

  const handleReplyClick = () => {
    if (status === "loading") return;

    if (!session) {
      if (typeof window !== "undefined") {
        localStorage.setItem("redirectUrl", window.location.pathname);
      }
      router.push("/login");
    }
  };

  const handleSubmitReply = async () => {
    if (!session) {
      handleReplyClick();
      return;
    }

    if (!replyContent.trim()) {
      toast.error("Please write something before posting");
      return;
    }

    try {
      const res = await createPost({
        thread: threadId,
        content: replyContent,
      }).unwrap();

      if (res.status === "success") {
        // toast.success("Reply posted successfully!");
        setReplyContent("");
      }
    } catch (error: unknown) {
      const err = error as {
        status?: number;
        data?: { message?: string };
      };
      toast.error(
        err?.data?.message || "Failed to post reply. Please try again!"
      );
    }
  };

  const handleNestedReply = async (parentId: string, content: string) => {
    if (!session) {
      handleReplyClick();
      return;
    }

    try {
      const res = await createPost({
        thread: threadId,
        parent: parentId,
        content: content,
      }).unwrap();

      if (res.status === "success") {
        toast.success("Reply posted successfully!");
      }
    } catch (error: unknown) {
      const err = error as {
        status?: number;
        data?: { message?: string };
      };
      toast.error(
        err?.data?.message || "Failed to post reply. Please try again!"
      );
    }
  };

  if (threadLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <p className="text-lg text-muted-foreground">Thread not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {env.NODE_ENV === "development" && (
        <div className="mb-4 text-xs text-muted-foreground">
          Socket: {isConnected ? "�� Connected" : "🔴 Disconnected"}
        </div>
      )}

      <Card className="border border-border bg-card p-6 mb-8 relative">
        <div>
          <ThreadSummary threadId={threadId} />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {thread.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              <span>{thread.user?.username || "Anonymous"}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>
                {formatDistance(new Date(thread.createdAt), new Date(), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="prose prose-sm max-w-none">
          <p className="text-foreground whitespace-pre-wrap">
            {thread.content}
          </p>
        </div>
      </Card>

      <Card className="border border-border bg-card p-6 mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Post a Reply
        </h2>

        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {session?.user?.username?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <Textarea
              placeholder={
                session ? "Write your reply..." : "Please login to post a reply"
              }
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="mb-3 min-h-24"
              readOnly={!session}
              onClick={handleReplyClick}
              disabled={isCreatingPost}
              rows={4}
            />
            <Button
              onClick={handleSubmitReply}
              disabled={!session || !replyContent.trim() || isCreatingPost}
            >
              {isCreatingPost ? "Posting..." : "Post Reply"}
            </Button>
          </div>
        </div>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Replies ({allPosts.length})
        </h2>

        {postsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : allPosts.length === 0 ? (
          <Card className="border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">
              No replies yet. Be the first to reply!
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {allPosts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                threadId={threadId}
                username={post.user.username}
                onReply={handleNestedReply}
                isReplying={isCreatingPost}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

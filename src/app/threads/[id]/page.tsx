"use client";

import { useState } from "react";
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
} from "@/redux/features/posts/posts-api";
import { toast } from "sonner";
import PostCard from "./_components/post-card";

export default function ThreadDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const threadId = params.id as string;

  const [replyContent, setReplyContent] = useState("");

  const { data: threadData, isLoading: threadLoading } =
    useGetSingleThreadQuery(threadId);
  const { data: postsData, isLoading: postsLoading } =
    useGetPostsQuery(threadId);
  const [createPost, { isLoading: isCreatingPost }] = useCreatePostMutation();

  const thread = threadData?.data?.thread;
  const posts = postsData?.data?.posts || [];

  const handleReplyClick = () => {
    if (status === "loading") return;

    if (!session) {
      // Store current path for redirect after login
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
        toast.success("Reply posted successfully!");
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
      {/* Thread Details Section */}
      <Card className="border border-border bg-card p-6 mb-8">
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

        <div className="prose prose-sm max-w-none">
          <p className="text-foreground whitespace-pre-wrap">
            {thread.content}
          </p>
        </div>
      </Card>

      {/* Reply Form Section */}
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

      {/* Posts Section */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Replies ({posts.length})
        </h2>

        {postsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <Card className="border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">
              No replies yet. Be the first to reply!
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                threadId={threadId}
                username="Anonymous" // Replace with actual user data when available
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

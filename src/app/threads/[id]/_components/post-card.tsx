"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Clock } from "lucide-react";
import { formatDistance } from "date-fns";
import { Post } from "@/redux/features/posts/posts-api";

interface PostCardProps {
  post: Post;
  threadId: string;
  username?: string;
  depth?: number;
  onReply: (parentId: string, content: string) => void;
  isReplying?: boolean;
}

export default function PostCard({
  post,
  threadId,
  username = "Anonymous",
  depth = 0,
  onReply,
  isReplying = false,
}: PostCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const handleSubmitReply = () => {
    if (replyContent.trim()) {
      onReply(post._id, replyContent);
      setReplyContent("");
      setShowReplyForm(false);
    }
  };

  const flagged = post.moderation.isSpam || post.moderation.isInappropriate;
  const flagLabel = post.moderation.isSpam
    ? "Spam"
    : post.moderation.isInappropriate
    ? "Inappropriate"
    : "";

  return (
    <div className={`${depth > 0 ? "ml-8 mt-4" : "mt-4"}`}>
      {/* Visual connector line for nested replies */}
      {depth > 0 && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-border" />
      )}

      <Card
        className={`relative bg-card p-4 ${
          flagged ? "border border-red-300 bg-red-50" : "border border-border"
        }`}
      >
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {username[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-sm text-foreground">
                {username}
              </span>
              {flagged && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                  {flagLabel || "Flagged"}
                </span>
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  {formatDistance(new Date(post.createdAt), new Date(), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>

            <p className="text-sm text-foreground mb-3 whitespace-pre-wrap wrap-break-word">
              {post.content}
            </p>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-primary"
            >
              Reply
            </Button>

            {/* Inline reply form */}
            {showReplyForm && (
              <div className="mt-3 space-y-2">
                <Textarea
                  placeholder="Write your reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-20"
                  disabled={isReplying}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSubmitReply}
                    disabled={!replyContent.trim() || isReplying}
                  >
                    {isReplying ? "Posting..." : "Post Reply"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowReplyForm(false);
                      setReplyContent("");
                    }}
                    disabled={isReplying}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Render nested children recursively */}
      {post.children && post.children.length > 0 && (
        <div className="relative pl-4 border-l-2 border-border ml-4">
          {post.children.map((childPost) => (
            <PostCard
              key={childPost._id}
              post={childPost}
              threadId={threadId}
              username={childPost.user.username}
              depth={depth + 1}
              onReply={onReply}
              isReplying={isReplying}
            />
          ))}
        </div>
      )}
    </div>
  );
}

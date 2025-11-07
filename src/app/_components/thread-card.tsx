"use client";

import { Card } from "@/components/ui/card";
import { Clock, User } from "lucide-react";
import { formatDistance } from "date-fns";

interface ThreadCardProps {
  id: number;
  title: string;
  author: string;
  createdAt: string;
}

export default function ThreadCard({
  title,
  author,
  createdAt,
}: ThreadCardProps) {
  return (
    <Card className="group cursor-pointer border border-border bg-card p-6 transition-all duration-200 hover:shadow-md hover:border-primary/30">
      <h3 className="mb-3 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
        {title}
      </h3>

      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <User className="h-4 w-4" />
          <span>{author}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          <span>
            {formatDistance(new Date(createdAt), new Date(), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>
    </Card>
  );
}

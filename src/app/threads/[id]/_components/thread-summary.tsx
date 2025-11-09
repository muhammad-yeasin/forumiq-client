import { Button } from "@/components/ui/button";
import { useLazyGetThreadSummaryByIdQuery } from "@/redux/features/threads/threads-api";
import { Loader2, Sparkles } from "lucide-react";

export default function ThreadSummary({ threadId }: { threadId: string }) {
  const [trigger, { data: summaryResp, isFetching, isError }] =
    useLazyGetThreadSummaryByIdQuery();

  const summary = summaryResp?.data;

  const handleGenerate = async () => {
    try {
      await trigger(threadId).unwrap?.();
    } catch {
      // silent - UI will show error
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          AI Summary
        </h3>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleGenerate}
            disabled={isFetching}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            {isFetching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Generate
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="rounded-md border border-border bg-card p-4">
        {isFetching ? (
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <div>
              <p className="text-sm font-medium">Generating summary…</p>
              <p className="text-xs text-muted-foreground">
                This may take a few seconds.
              </p>
            </div>
          </div>
        ) : isError ? (
          <div className="text-sm text-destructive">
            Failed to generate summary. Try again.
          </div>
        ) : summary ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary/10 p-1">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Generated Summary</h2>
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {summary}
            </p>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            Click Generate to create an AI summary for this thread.
          </div>
        )}
      </div>
    </div>
  );
}

import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function CreateThread() {
  return (
    <div className="mb-8 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <Avatar className="mt-1 h-10 w-10 shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground">
            U
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Share or Ask Something to Everyone?"
            className="mb-3 border-0 bg-muted placeholder:text-muted-foreground focus-visible:ring-0"
          />
          <div className="flex justify-end">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus /> Create Thread
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

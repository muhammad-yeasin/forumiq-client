"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { TextInput, TextAreaInput } from "@/components/input";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useCreateThreadMutation } from "@/redux/features/threads/threads-api";

const threadSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
});

type ThreadFormValues = z.infer<typeof threadSchema>;

export default function CreateThread() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [createThread, { isLoading }] = useCreateThreadMutation();

  const form = useForm<ThreadFormValues>({
    resolver: zodResolver(threadSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const handleOpenModal = () => {
    if (status === "loading") return;

    if (!session) {
      // Store current path for redirect after login
      if (typeof window !== "undefined") {
        localStorage.setItem("redirectUrl", window.location.pathname);
      }
      router.push("/login");
      return;
    }

    setOpen(true);
  };

  async function onSubmit(values: ThreadFormValues) {
    try {
      const res = await createThread(values).unwrap();
      if (res.status === "success") {
        toast.success("Thread created successfully!");
        setOpen(false);
        form.reset();
      }
    } catch (error: unknown) {
      const err = error as {
        status?: number;
        data?: {
          errors?: Array<{ field: string; message: string }>;
          message?: string;
        };
      };
      if (err.status === 400 && err?.data?.errors) {
        err.data.errors.forEach((fieldError) => {
          form.setError(fieldError.field as keyof ThreadFormValues, {
            message: fieldError.message,
          });
        });
      } else {
        toast.error(
          err?.data?.message ||
            "Failed to create thread. Please try again later!"
        );
      }
    }
  }

  return (
    <>
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
              className="mb-3 border-0 bg-muted placeholder:text-muted-foreground focus-visible:ring-0 cursor-pointer"
              onClick={handleOpenModal}
              readOnly
            />
            <div className="flex justify-end">
              <Button
                onClick={handleOpenModal}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus /> Create Thread
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create a New Thread</DialogTitle>
            <DialogDescription>
              Share your thoughts or ask a question to the community.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <TextInput<ThreadFormValues>
                name="title"
                label="Title"
                placeholder="Enter thread title"
                control={form.control}
              />

              <TextAreaInput<ThreadFormValues>
                name="content"
                label="Content"
                placeholder="Write your content here..."
                control={form.control}
                rows={6}
              />

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    form.reset();
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Thread"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

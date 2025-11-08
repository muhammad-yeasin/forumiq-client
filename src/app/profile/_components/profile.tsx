/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdateProfileMutation } from "@/redux/features/user/user-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { TextInput } from "@/components/input";
import { useSession } from "next-auth/react";

const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.email("Invalid email address"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Profile() {
  const { data: session, update } = useSession();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [updateProfile] = useUpdateProfileMutation();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
      email: "",
    },
  });

  const handleCancel = () => {
    form.reset({
      username: "",
      email: "",
    });
    setIsEditing(false);
  };

  useEffect(() => {
    if (session) {
      form.reset({
        username: session.user.username || "",
        email: session.user.email || "",
      });
    }
  }, [session]);

  const onSubmit = async (values: ProfileFormValues) => {
    setIsLoading(true);
    try {
      const res = await updateProfile({
        username: values.username.trim(),
        email: values.email.trim(),
      }).unwrap();

      if (res.status === "success") {
        (async () => {
          await update({
            ...session,
            user: {
              ...session?.user,
              username: values.username,
              email: values.email,
            },
          });
        })();
        // toast.success("Profile updated successfully");
        setIsEditing(false);
      } else {
        toast.error(res.message || "Failed to update profile");
      }
    } catch (error: unknown) {
      const err = error as {
        status?: number;
        data?: { errors?: Array<{ message?: string }> };
      };
      if (err.status === 400 && err?.data?.errors) {
        err.data.errors.forEach((e) => {
          toast.error(e.message || "Invalid input");
        });
      } else {
        toast.error("Failed to update profile. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-73px)] items-start justify-center px-4 py-8 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Update Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-end">
              {!isEditing ? (
                <Button size="sm" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      void form.handleSubmit(onSubmit)();
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save"}
                  </Button>
                </div>
              )}
            </div>

            {isEditing && (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-3"
                >
                  <div>
                    <TextInput<ProfileFormValues>
                      name="username"
                      label="Username"
                      placeholder="Choose a username"
                      control={form.control}
                    />
                  </div>
                  <div>
                    <TextInput<ProfileFormValues>
                      name="email"
                      label="Email"
                      placeholder="you@example.com"
                      control={form.control}
                    />
                  </div>
                </form>
              </Form>
            )}

            {!isEditing && session && (
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Username</p>
                  <p className="text-base text-foreground">
                    {session.user.username}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-base text-foreground">
                    {session.user.email}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

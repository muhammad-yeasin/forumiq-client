/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { TextInput } from "@/components/input";
import { useSignupByEmailMutation } from "@/redux/features/auth/auth-api";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [signup] = useSignupByEmailMutation();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    let redirectPathname = "/";
    if (typeof window !== "undefined") {
      redirectPathname = localStorage.getItem("redirectUrl") || "/";
      localStorage.removeItem("redirectUrl");
    }
    try {
      setIsLoading(true);
      const res = await signup(values).unwrap();
      if (res.status === "success") {
        const res = await signIn("credentials", {
          email: values.email,
          password: values.password,
          redirect: false,
          callbackUrl: "/",
        });
        setIsLoading(false);
        if (res?.status === 200) {
          router.replace(redirectPathname);
        } else {
          toast.error("Failed to create account. Please try again later!");
        }
      }
    } catch (error: any) {
      if (error.status === 400 && error?.data?.errors) {
        error.data.errors.forEach((err: any) => {
          form.setError(err.field, { message: err.message });
        });
      } else {
        toast.error("Failed to create account. Please try again later!");
      }
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Sign up for ForumIQ</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <TextInput<RegisterFormValues>
                name="username"
                label="Username"
                placeholder="Choose a username"
                control={form.control}
              />

              <TextInput<RegisterFormValues>
                name="email"
                label="Email"
                placeholder="you@example.com"
                control={form.control}
              />

              <TextInput<RegisterFormValues>
                name="password"
                label="Password"
                placeholder="Create a password"
                control={form.control}
                type="password"
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Sign Up"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

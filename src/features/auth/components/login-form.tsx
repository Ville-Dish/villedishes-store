"use client";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loginSchema, LoginSchema } from "@/lib/schemas/authSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  EyeClosedIcon,
  EyeIcon,
  Loader2Icon,
  LogInIcon,
  OctagonAlertIcon,
} from "lucide-react";
import Link from "next/link";
import { signInAction } from "@/actions/authActions";
import { Alert } from "@/components/ui/alert";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export const LoginForm = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [isloading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  //   const isLoading = login.isPending;

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const login = useMutation(
    trpc.auth.login.mutationOptions({
      onSuccess: async () => {
        toast.success("Login Successful");
        router.push("/admin/dashboard");
      },
      onError: (error) => {
        setError(error.message);
        toast.error("An error occurred during login");
      },
    }),
  );

  const onSubmit = async (values: LoginSchema) => {
    setError(null);
    const validatedFields = loginSchema.safeParse(values);

    if (!validatedFields.success) {
      toast.error("Invalid email/password");
      return;
    }

    const { email, password } = validatedFields.data;

    login.mutate({ email, password });
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
        <CardDescription>Sign in to access your account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!!error && (
          <Alert className="bg-destructive/10 border-none">
            <OctagonAlertIcon className="size-4 text-destructive!" />
            <p className="text-xs wrap-break-word whitespace-normal!">
              {error}
            </p>
          </Alert>
        )}

        {/* Email/Password Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      disabled={isloading}
                    />
                  </FormControl>
                  <div className="min-h-5">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        disabled={isloading}
                      />

                      <Button
                        variant="ghost"
                        type="button"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isloading || !form.watch("password")}
                      >
                        {showPassword ? (
                          <EyeIcon className="size-4" />
                        ) : (
                          <EyeClosedIcon className="size-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <div className="min-h-5">
                    <FormMessage />
                    <Link
                      href="/"
                      className="ml-auto inline-block text-sm font-light underline-offset-4 hover:underline hover:text-blue-500"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full mt-6 bg-[#1aa879]"
              disabled={isloading}
            >
              {isloading ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogInIcon className="size-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center">
          <p className="text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

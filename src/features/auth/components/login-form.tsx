"use client";

import { useState, useTransition } from "react";

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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export const LoginForm = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const login = useMutation(
    trpc.auth.login.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.auth.session.queryOptions());

        await delay(5000);
        toast.success("Login Successful");
        startTransition(() => {
          router.push("/admin/dashboard");
        });
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

  const isLoading = login.isPending || isPending;

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
        <CardDescription>Sign in to access your account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!!error && (
          <Alert
            variant="destructive"
            className="bg-destructive/10 border-none"
          >
            <OctagonAlertIcon className="size-4" />
            <AlertTitle className="text-xs font-bold">
              Authentication Error
            </AlertTitle>
            <AlertDescription className="text-xs wrap-break-word whitespace-normal!">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Email/Password Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="flex items-center">
                    <span>Password</span>

                    <Link
                      href="/"
                      className="ml-auto text-xs font-light underline-offset-4 hover:underline hover:text-blue-500"
                    >
                      Forgot your password?
                    </Link>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        disabled={isLoading}
                      />

                      <Button
                        variant="ghost"
                        type="button"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading || !form.watch("password")}
                      >
                        {showPassword ? (
                          <EyeIcon className="size-4" />
                        ) : (
                          <EyeClosedIcon className="size-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full mt-2 bg-[#1aa879] hover:bg-[#1aa879]/90 cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? (
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

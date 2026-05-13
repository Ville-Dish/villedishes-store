"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useDebounce } from "use-debounce";

import { signupSchema, SignupSchema } from "@/lib/schemas/authSchema";
import { passwordStrength } from "@/lib/utils";

import { toast } from "sonner";

import { PasswordStrength } from "@/features/auth/components/password-strength";

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
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { CustomFormLabel } from "@/components/custom/form-label";
import { CustomPhoneInput } from "@/components/custom/phone-input";
import { Eye, EyeClosed, Loader2Icon, UserPlus } from "lucide-react";
import Link from "next/link";
import { signUpAction } from "@/actions/authActions";

export type PasswordScore = {
  score: number;
  strength: "weak" | "good" | "strong";
  errors: string[];
};

export const SignUpForm = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [strength, setStrength] = useState<PasswordScore>({
    score: 0,
    strength: "weak",
    errors: [],
  });
  const [loading, setLoading] = useState(false);

  const form = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
    },
  });

  const onSubmit = async (values: SignupSchema) => {
    // Validate the form data
    const validatedFields = signupSchema.safeParse(values);

    if (!validatedFields.success) {
      toast.error("Please check your information. It cannot be validated");
      return;
    }
    setLoading(true);
    try {
      const result = await signUpAction(validatedFields.data);
      if (result.success) {
        toast.success("Registration successful! Please login.");
        router.push("/login");
      }
    } catch (error) {
      console.error("Signup failed:", error);
      toast.error("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const [currentPassword] = useDebounce(form.watch("password"), 300);
  const currentConfirmPassword = form.watch("confirmPassword");

  useEffect(() => {
    const { strength, errors } = passwordStrength(currentPassword);

    if (strength === "weak") {
      setStrength({ score: 50, strength, errors });
    }

    if (strength === "good") {
      setStrength({ score: 75, strength, errors });
    }

    if (strength === "strong") {
      setStrength({ score: 100, strength, errors });
    }
  }, [currentPassword]);

  return (
    <Card className="w-full max-w-2xl shadow-lg">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-bold">Admin Sign Up</CardTitle>
        <CardDescription>
          Create an account to request pickup services
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <CustomFormLabel title="First Name" />
                    <FormControl>
                      <Input
                        {...field}
                        id="firstName"
                        name="firstName"
                        placeholder="First name"
                        disabled={loading}
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
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <CustomFormLabel title="Last Name" />
                    <FormControl>
                      <Input
                        {...field}
                        id="lastName"
                        name="lastName"
                        placeholder="Last name"
                        disabled={loading}
                      />
                    </FormControl>
                    <div className="min-h-5">
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Email & Phone Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <CustomFormLabel title="Email Address" />
                    <FormControl>
                      <Input
                        {...field}
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your.email@example.com"
                        disabled={loading}
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
                name="phoneNumber"
                render={({ field, fieldState }) => {
                  return (
                    <FormItem>
                      <CustomFormLabel title="Phone Number" />
                      <FormControl>
                        <CustomPhoneInput
                          placeholder="(123) 456-7890"
                          defaultCountry="CA"
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          error={fieldState.error}
                          disabled={loading}
                        />
                      </FormControl>
                      <div className="min-h-5">
                        <FormMessage />
                      </div>
                    </FormItem>
                  );
                }}
              />
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <CustomFormLabel title="Password" />
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="**************"
                          disabled={loading}
                        />
                        <Button
                          variant="ghost"
                          type="button"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={loading || !form.watch("password")}
                        >
                          {showPassword ? (
                            <Eye className="size-4" />
                          ) : (
                            <EyeClosed className="size-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>

                    {/* Password strength (mobile only) */}
                    {currentPassword && (
                      <div className="block md:hidden mt-2">
                        <PasswordStrength strength={strength} />
                      </div>
                    )}

                    <div className="min-h-5">
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <CustomFormLabel title="Confirm Password" />
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="**************"
                          disabled={loading}
                        />

                        <Button
                          variant="ghost"
                          type="button"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-600"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          disabled={loading || !currentConfirmPassword}
                        >
                          {showConfirmPassword ? (
                            <Eye className="size-4" />
                          ) : (
                            <EyeClosed className="size-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <div className="min-h-5">
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              {/* Password strength under both fields on large screens */}
              {currentPassword && (
                <div className="hidden md:block col-span-2">
                  <PasswordStrength strength={strength} />
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-[#1aa879]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="size-4" />
                  Create Account
                </>
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center">
          <p className="text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export const SignupFormSkeleton = () => {
  return (
    <Card className="w-full max-w-2xl shadow-lg">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-bold">Join Our Community</CardTitle>
        <CardDescription>
          Create an account to request pickup services
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="size-24" /> {/* Label */}
              <Skeleton className="h-10 w-full" /> {/* Input */}
              <div className="min-h-5" />
            </div>
            <div className="space-y-2">
              <Skeleton className="size-24" />
              <Skeleton className="h-10 w-full" />
              <div className="min-h-5" />
            </div>
          </div>

          {/* Email & Phone Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
              <div className="min-h-5" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
              <div className="min-h-5" />
            </div>
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
              <div className="min-h-5" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-10 w-full" />
              <div className="min-h-5" />
            </div>
          </div>

          {/* Submit Button */}
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Sign in link */}
        <div className="mt-6 text-center">
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </CardContent>
    </Card>
  );
};

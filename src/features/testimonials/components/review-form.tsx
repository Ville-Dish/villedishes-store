"use client";

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  testimonialSchema,
  TestimonialSchema,
} from "@/lib/schemas/productSchema";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, MessageSquarePlus, Send } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export const ReviewForm = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<TestimonialSchema>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      comment: "",
      isAnonymous: false,
      authorName: "",
    },
  });
  const isSubmitted = form.formState.isSubmitSuccessful;

  const createTestimonial = useMutation(
    trpc.testimonials.createTestimonial.mutationOptions({
      onSuccess: async (data) => {
        toast.success(
          `Your feedback has been submitted successfully and is awaiting review. We appreciate you taking the time to share your experience.`,
        );

        queryClient.invalidateQueries(
          trpc.testimonials.getTestimonials.queryOptions(),
        );
      },
      onError: (error) => {
        toast.error(error.message || `Failed to submit testimonial`);
      },
    }),
  );

  //   console.log("Form errors:", form.formState.errors);

  const isAnonymous = form.watch("isAnonymous");

  const onSubmit = async (data: TestimonialSchema) => {
    await createTestimonial.mutateAsync({
      comment: data.comment,
      authorName: data.authorName,
      isAnonymous: data.isAnonymous,
    });
  };

  if (isSubmitted) {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-16">
        <div className="mb-10 flex flex-col items-center gap-2 text-center">
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            We'd love to hear from you
          </h1>
          <p className="max-w-md text-pretty text-muted-foreground leading-relaxed">
            Your feedback helps us build better products and deliver experiences
            that matter.
          </p>
        </div>
        <Card className="w-full max-w-lg border-0 shadow-lg">
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent">
              <CheckCircle2 className="h-8 w-8 text-accent-foreground" />
            </div>
            <h3 className="text-2xl font-semibold text-foreground">
              Thank you for your feedback!
            </h3>
            <p className="text-muted-foreground leading-relaxed max-w-sm">
              Your testimonial has been submitted successfully and is awaiting
              review. We appreciate you taking the time to share your
              experience.
            </p>
            <Button
              variant="outline"
              className="mt-4 bg-transparent"
              onClick={() => {
                isSubmitted;
                form.reset();
              }}
            >
              Submit another
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-16">
      <div className="mb-10 flex flex-col items-center gap-2 text-center">
        <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          We'd love to hear from you
        </h1>
        <p className="max-w-md text-pretty text-muted-foreground leading-relaxed">
          Your feedback helps us build better products and deliver experiences
          that matter.
        </p>
      </div>
      <Card className="w-full max-w-lg border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
              <MessageSquarePlus className="h-5 w-5 text-primary-foreground" />
            </div>
            <CardTitle className="text-xl">Share Your Feedback</CardTitle>
          </div>
          <CardDescription className="leading-relaxed">
            We value your opinion. Let us know about your experience so we can
            continue to improve.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-6"
            >
              {/* Anonymous Toggle */}
              <FormField
                control={form.control}
                name="isAnonymous"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-4">
                    <div className="flex flex-col gap-0.5">
                      <FormLabel className="text-sm font-medium text-foreground">
                        Submit anonymously
                      </FormLabel>
                      <FormDescription className="text-xs">
                        Your name will not be displayed with your feedback.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (checked) {
                            form.setValue("authorName", "");
                            form.clearErrors("authorName");
                            console.log(checked);
                          }
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Author Name */}
              {!isAnonymous && (
                <FormField
                  control={form.control}
                  name="authorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your full name"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Comment */}
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Your Feedback</FormLabel>
                      <span className="text-xs text-muted-foreground">
                        {field.value?.length ?? 0}/1000
                      </span>
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your experience..."
                        className="min-h-35 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                <Send className="mr-2 h-4 w-4" />
                {form.formState.isSubmitting
                  ? "Submitting..."
                  : "Submit Feedback"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
};

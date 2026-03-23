"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import {
  verifyPaymentSchema,
  VerifyPaymentValue,
} from "@/lib/schemas/orderSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export const VerifyPaymentView = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<VerifyPaymentValue>({
    resolver: zodResolver(verifyPaymentSchema),
    defaultValues: {
      orderId: "",
      providedVerificationCode: "",
    },
  });

  useEffect(() => {
    const id = String(searchParams.get("orderId")) || "";
    if (!id) {
      toast.error("Order ID is missing");
      return;
    }
    form.setValue("orderId", id);
  }, [searchParams, form]);

  const calculateEstimatedDelivery = (date: string | Date) => {
    const base = new Date(date);
    return new Date(base.getTime() + 48 * 3600000).toISOString().split("T")[0];
  };

  const sendConfirmationEmail = useMutation(
    trpc.mail.sendEmail.mutationOptions({
      onSuccess: () => {
        toast.success("Order Confirmed", {
          description:
            "An order confirmation email has been sent to the customer.",
        });
      },
      onError: (error) => {
        console.error("Error sending verification email:", error);
        toast.error("Failed to send verification email", {
          description:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        });
      },
    }),
  );

  const verifyOrderPayment = useMutation(
    trpc.orders.updateOrder.mutationOptions({
      onSuccess: (data) => {
        toast.success("Order Verified", {
          description: `Order ${data.order.orderNumber} has been verified. An order confirmation email will be sent to the customer.`,
        });

        const orderDetails = data.order;

        const estimatedDelivery = calculateEstimatedDelivery(
          orderDetails.orderDate ?? new Date().toISOString().split("T")[0],
        );

        const emailData = {
          customerName: `${orderDetails.shippingInfo.firstName} ${orderDetails.shippingInfo.lastName}`,
          orderNumber: orderDetails.orderNumber!,
          orderDate: orderDetails.orderDate?.toISOString().split("T")[0]!,
          subtotal: orderDetails.subtotal,
          tax: orderDetails.tax,
          shippingFee: orderDetails.shippingFee,
          total: orderDetails.total,
          items: orderDetails.products,
          estimatedDelivery,
        };

        sendConfirmationEmail.mutate({
          type: "order_confirmation",
          to: orderDetails.shippingInfo.email,
          ...emailData,
        });

        form.reset();

        queryClient.invalidateQueries(
          trpc.orders.getPaginatedOrders.queryOptions({}),
        );

        router.push("/admin/success");
      },
      onError: (error) => {
        console.error("Error placing order:", error);
        toast.error("Failed to place order", {
          description:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        });
      },
    }),
  );

  const onSubmit = async (values: VerifyPaymentValue) => {
    const validatedFields = await verifyPaymentSchema.safeParseAsync(values);

    if (!validatedFields.success) {
      toast.error(
        validatedFields.error.message || "Please fill in all required fields",
      );
      return;
    }

    verifyOrderPayment.mutateAsync(validatedFields.data);
  };

  const isLoading = form.formState.isSubmitting || verifyOrderPayment.isPending;

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Verify User Payment</CardTitle>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent>
                {/* verification code */}
                <FormField
                  control={form.control}
                  name="providedVerificationCode"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="after:content-['*'] after:text-sm after:text-red-500 after:-ml-1 -mt-1">
                        Verification Code
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id="providedVerificationCode"
                          name="providedVerificationCode"
                          placeholder="Enter verification code"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* order ID */}
                {/* Hidden field synced via setValue */}
                <input type="hidden" {...form.register("orderId")} />
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Verify Payment"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </main>
    </div>
  );
};

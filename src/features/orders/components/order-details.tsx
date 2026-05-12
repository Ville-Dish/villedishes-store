"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ADMIN_EMAIL } from "@/config/constants";
import {
  cancelOrderProcessSchema,
  CancelOrderProcessValue,
} from "@/lib/schemas/orderSchema";

import { OrderInfo } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { da } from "@faker-js/faker";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Mail,
  MapPin,
  Package,
  Phone,
  Receipt,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface OrderDetailsProps {
  data: OrderInfo;
}

export const OrderDetailsView = ({ data }: OrderDetailsProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [isCancelled, setIsCancelled] = useState<boolean | null>(false);

  const form = useForm<CancelOrderProcessValue>({
    resolver: zodResolver(cancelOrderProcessSchema),
    defaultValues: {
      orderId: "",
      refundReferenceNumber: "",
    },
  });

  useEffect(() => {
    if (data?.orderId) {
      form.setValue("orderId", data.orderId);
    }
  }, [data?.orderId, form]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CANCELLATION_REQUESTED":
        return (
          <Badge variant="destructive" className="gap-1.5">
            <AlertTriangle className="size-3" />
            Cancellation Requested
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge className="gap-1.5 bg-emerald-600 hover:bg-emerald-600">
            <CheckCircle2 className="size-3" />
            Completed
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1.5">
            <Package className="size-3" />
            {status}
          </Badge>
        );
    }
  };

  // trpc call
  const sendMail = useMutation(
    trpc.mail.sendEmail.mutationOptions({
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

  const sendVerificationEmail = async (orderDetails: OrderInfo) => {
    const emailData = {
      customerName: `${orderDetails.shippingInfo.firstName} ${orderDetails.shippingInfo.lastName}`,
      orderNumber: orderDetails.orderNumber!,
      orderId: orderDetails.orderId!,
      orderDate: orderDetails.orderDate?.toISOString().split("T")[0]!,
      subtotal: orderDetails.subtotal,
      tax: orderDetails.tax,
      shippingFee: orderDetails.shippingFee,
      total: orderDetails.total,
      items: orderDetails.products,
      estimatedDelivery: new Date(orderDetails.scheduledAt ?? new Date())
        .toISOString()
        .split("T")[0]!,
    };

    sendConfirmationEmail.mutate({
      type: "order_confirmation",
      to: orderDetails.shippingInfo.email,
      ...emailData,
    });
  };

  const sendCancellationEmail = async (orderData: OrderInfo) => {
    const emailData = {
      customerName: `${orderData.shippingInfo.firstName} ${orderData.shippingInfo.lastName}`,
      customerInteracEmail: orderData.shippingInfo.email,
      orderNumber: orderData.orderNumber || "",
      orderDate: orderData.orderDate
        ? new Date(orderData.orderDate.toISOString()).toDateString()
        : new Date().toDateString(),
      reason: "No reason provided",
      total: orderData.total,
    };

    sendConfirmationEmail.mutate({
      type: "order_cancellation_request",
      to: ADMIN_EMAIL,
      ...emailData,
    });
  };

  const cancelOrderMutation = useMutation(
    trpc.orders.processOrderCancel.mutationOptions({
      onSuccess: () => {
        toast.success("Cancellation requested successfully");
        setIsCancelled(true);
        form.reset();

        queryClient.invalidateQueries(
          trpc.orders.getOrder.queryOptions({ orderId: data.orderId! }),
        );
        // TODO: send email about order cancellation
        sendMail.mutate({
          type: "order_cancellation_confirmation",
          to: data.shippingInfo.email,
          customerName: `${data.shippingInfo.firstName} ${data.shippingInfo.lastName}`,
          orderNumber: data.orderNumber ?? "",
          total: data.total,
        });
      },
      onError: (error) => {
        toast.error(error.message ?? "Failed to cancel order");
      },
    }),
  );

  const onSubmit = async (values: CancelOrderProcessValue) => {
    await cancelOrderMutation.mutateAsync({
      orderId: data.orderId,
      refundReferenceNumber: values.refundReferenceNumber,
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
              Order Receipt
            </h1>
            <p className="text-muted-foreground mt-1">
              Order #{data.orderNumber}
            </p>
          </div>
          <div className="flex flex-col sm:items-end gap-2">
            {getStatusBadge(data.status || "PROCESSING")}
            <p className="text-sm text-muted-foreground">
              {formatDate(data.orderDate!)}
            </p>
          </div>
        </div>
      </div>

      {/* Address Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
        {/* Bill To Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
                <User className="size-4 text-primary" />
              </div>
              <CardTitle className="text-base">Bill To</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-medium text-foreground">
              {data.shippingInfo.firstName} {data.shippingInfo.lastName}
            </p>
            <p className="text-sm text-muted-foreground">
              {data.shippingInfo.address}
            </p>
            <p className="text-sm text-muted-foreground">
              {data.shippingInfo.city}, {data.shippingInfo.postalCode}
            </p>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {data.shippingInfo.email}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {data.shippingInfo.phoneNumber}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ship To Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
                <MapPin className="size-4 text-primary" />
              </div>
              <CardTitle className="text-base">Ship To</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-medium text-foreground">
              {data.shippingInfo.firstName} {data.shippingInfo.lastName}
            </p>
            <p className="text-sm text-muted-foreground">
              {data.shippingInfo.address}
            </p>
            <p className="text-sm text-muted-foreground">
              {data.shippingInfo.city}, {data.shippingInfo.postalCode}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Products Card */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
              <Package className="size-4 text-primary" />
            </div>
            <CardTitle className="text-base">Products</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                    Product
                  </th>
                  <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">
                    Quantity
                  </th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">
                    Price
                  </th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.products.map((product, index) => (
                  <tr
                    key={product.id}
                    className={
                      index !== data.products.length - 1
                        ? "border-b border-border/50"
                        : ""
                    }
                  >
                    <td className="py-4 px-2">
                      <span className="font-medium text-foreground">
                        {product.product.name}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-center text-muted-foreground">
                      {product.quantity}
                    </td>
                    <td className="py-4 px-2 text-right text-muted-foreground">
                      ${product.product.price.toFixed(2)}
                    </td>
                    <td className="py-4 px-2 text-right font-medium text-foreground">
                      ${(product.quantity * product.product.price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {data.products.map((product, index) => (
              <div
                key={product.id}
                className={`pb-4 ${
                  index !== data.products.length - 1
                    ? "border-b border-border/50"
                    : ""
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-foreground">
                    {product.product.name}
                  </span>
                  <span className="font-medium text-foreground">
                    ${(product.quantity * product.product.price).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Qty: {product.quantity}</span>
                  <span>${product.product.price.toFixed(2)} each</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Order Summary & Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Order Notes */}
        {data.shippingInfo.orderNotes && (
          <Card className="md:order-1">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
                  <FileText className="size-4 text-primary" />
                </div>
                <CardTitle className="text-base">Order Notes</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {data.shippingInfo.orderNotes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Order Summary */}
        <Card
          className={`${
            data.shippingInfo.orderNotes
              ? "md:order-2"
              : "md:col-span-2 md:max-w-md md:ml-auto"
          }`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
                <Receipt className="size-4 text-primary" />
              </div>
              <CardTitle className="text-base">Order Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">
                ${data.subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span className="text-foreground">${data.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-foreground">
                ${data.shippingFee.toFixed(2)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between pt-1">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-semibold text-foreground text-lg">
                ${data.total.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cancellation Alert - Now at the bottom */}
      {data.status === "CANCELLATION_REQUESTED" && (
        <Card className="mt-6 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-amber-600 dark:text-amber-500" />
              <CardTitle className="text-amber-800 dark:text-amber-400">
                Cancellation Request Pending
              </CardTitle>
            </div>
            <CardDescription className="text-amber-700 dark:text-amber-500">
              A refund of ${data.total.toFixed(2)} is required. Payment method:{" "}
              {data.referenceNumber ? "INTERAC" : "Payment Gateway"}.
            </CardDescription>
          </CardHeader>
          {data.referenceNumber && (
            <CardContent className="pt-0">
              <p className="text-sm text-amber-700 dark:text-amber-500 mb-3">
                Please provide the Interac reference number for the customer to
                track their refund.
              </p>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <FormField
                    control={form.control}
                    name="refundReferenceNumber"
                    render={({ field }) => (
                      <Input
                        placeholder="Enter Interac Reference Number"
                        className="flex-1 bg-background"
                        {...field}
                      />
                    )}
                  />
                  {isCancelled ? (
                    <Button className="w-full sm:w-auto">Submit Refund</Button>
                  ) : (
                    <Button
                      variant="destructive"
                      onClick={() => setIsCancelled(null)}
                      className="w-full sm:w-auto"
                    >
                      Process Cancellation
                    </Button>
                  )}
                </form>
              </Form>
            </CardContent>
          )}
          {!data.referenceNumber && (
            <CardContent className="pt-0">
              <div className="flex flex-col sm:flex-row gap-3">
                {isCancelled ? (
                  <Button className="w-full sm:w-auto">Submit Refund</Button>
                ) : (
                  <Button
                    variant="destructive"
                    onClick={() => setIsCancelled(null)}
                    className="w-full sm:w-auto"
                  >
                    Process Cancellation
                  </Button>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Resend Email Button */}
      {data.status === "PENDING" && (
        <div className="mt-6 flex justify-end">
          <Button
            className="cursor-pointer"
            onClick={() => sendVerificationEmail(data)}
          >
            Resend Verification Email
          </Button>
        </div>
      )}
    </div>
  );
};

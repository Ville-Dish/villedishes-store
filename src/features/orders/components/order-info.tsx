"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { OrderInfo } from "@/lib/types";
import { formatDate, OrderStatus } from "@/lib/utils";
import { useState, useEffect } from "react";
import {
  Package,
  MapPin,
  Receipt,
  User,
  Mail,
  Phone,
  FileText,
  XCircle,
  Star,
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  AlertCircle,
  Ban,
} from "lucide-react";
import {
  cancelOrderRequestSchema,
  CancelOrderRequestValue,
  reviewSchema,
} from "@/lib/schemas/orderSchema";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { z } from "zod";
import { ADMIN_EMAIL } from "@/config/constants";

const NON_CANCELLABLE_STATUSES: OrderStatus[] = [
  "SHIPPED",
  "DELIVERED",
  "FULFILLED",
  "CANCELLATION_REQUESTED",
  "CANCELLED",
];

const CANCELLABLE_STATUSES: OrderStatus[] = ["PENDING", "UNVERIFIED"];

// ✅ Props support
type Props = {
  orderId?: string;
};

const DEV_FALLBACK_ORDER_ID = "1772296669460";

export const OrderInformationView = ({ orderId: propOrderId }: Props) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  // const [orderId, setOrderId] = useState<string | null>(null);

  const [hoveredRatings, setHoveredRatings] = useState<number[]>([]);

  const setHoveredRating = (index: number, value: number) => {
    setHoveredRatings((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const clearHoveredRating = (index: number) => {
    setHoveredRatings((prev) => {
      const next = [...prev];
      next[index] = 0;
      return next;
    });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const cancelForm = useForm<CancelOrderRequestValue>({
    resolver: zodResolver(cancelOrderRequestSchema),
    defaultValues: {
      orderId: "",
      cancellationReason: "",
      interacEmail: "",
      paymentType: "ETRANSFER",
    },
  });

  type ReviewFormInput = z.input<typeof reviewSchema>;

  const reviewForm = useForm<ReviewFormInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      orderId: "",
      author: "",
      isAnonymous: false,
      reviews: [],
    },
  });

  const { fields: reviewFields } = useFieldArray({
    control: reviewForm.control,
    name: "reviews",
  });

  const watchedPaymentType = cancelForm.watch("paymentType");
  // const watchedRating = reviewForm.watch("rating");

  const orderId =
    searchParams.get("orderId") || propOrderId || DEV_FALLBACK_ORDER_ID;

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

  console.log("Order Id", orderId);

  const cancelOrderMutation = useMutation(
    trpc.orders.requestCancelOrder.mutationOptions({
      onSuccess: (data) => {
        if (!data) return;
        toast.success("Cancellation requested successfully");
        setCancelDialogOpen(false);
        cancelForm.reset();

        queryClient.invalidateQueries(
          trpc.orders.getOrder.queryOptions({ orderId: orderId! }),
        );

        const orderData = data.order;

        // TODO: send email about order cancellation
        sendMail.mutate({
          type: "order_cancellation_request",
          to: ADMIN_EMAIL,
          customerName: `${orderData.shippingInfo.firstName} ${orderData.shippingInfo.lastName}`,
          customerInteracEmail:
            cancelForm.getValues("interacEmail") ||
            orderData.shippingInfo.email,
          orderNumber: orderData.orderNumber || "",
          orderDate: orderData.orderDate
            ? new Date(orderData.orderDate.toISOString()).toDateString()
            : new Date().toDateString(),
          reason:
            cancelForm.getValues("cancellationReason") || "No reason provided",
          total: orderData.total,
        });
      },
      onError: (error) => {
        toast.error(error.message ?? "Failed to cancel order");
        console.log("Error cancelling order:", error);
      },
    }),
  );

  const createReviewMutation = useMutation(
    trpc.review.createReview.mutationOptions({
      onSuccess: () => {
        toast.success("Review submitted successfully!");
        setReviewDialogOpen(false);
        reviewForm.reset();
      },
      onError: (error) => {
        toast.error(error.message ?? "Failed to submit review");
      },
    }),
  );

  const { data, isLoading: loadingOrder } = useSuspenseQuery(
    trpc.orders.getOrder.queryOptions(
      {
        orderId: orderId!,
      },
      {
        enabled: !!orderId,
      },
    ),
  );

  const canReviewOrder = (): boolean => {
    return data?.status === "FULFILLED";
  };

  const getStatusBadge = (status: OrderStatus | undefined) => {
    const statusConfig: Record<
      OrderStatus,
      {
        icon: React.ReactNode;
        label: string;
        className: string;
      }
    > = {
      UNVERIFIED: {
        icon: <Clock className="size-3" />,
        label: "Unverified",
        className: "bg-amber-100 text-amber-800 border-amber-200",
      },
      PENDING: {
        icon: <Clock className="size-3" />,
        label: "Pending",
        className: "bg-blue-100 text-blue-800 border-blue-200",
      },
      SHIPPED: {
        icon: <Truck className="size-3" />,
        label: "Shipped",
        className: "bg-indigo-100 text-indigo-800 border-indigo-200",
      },
      DELIVERED: {
        icon: <PackageCheck className="size-3" />,
        label: "Delivered",
        className: "bg-teal-100 text-teal-800 border-teal-200",
      },
      FULFILLED: {
        icon: <CheckCircle2 className="size-3" />,
        label: "Fulfilled",
        className: "bg-emerald-100 text-emerald-800 border-emerald-200",
      },
      CANCELLATION_REQUESTED: {
        icon: <AlertCircle className="size-3" />,
        label: "Cancellation Requested",
        className: "bg-orange-100 text-orange-800 border-orange-200",
      },
      CANCELLED: {
        icon: <Ban className="size-3" />,
        label: "Cancelled",
        className: "bg-red-100 text-red-800 border-red-200",
      },
    };

    const config = status
      ? statusConfig[status]
      : {
          icon: <Package className="size-3" />,
          label: "Processing",
          className: "bg-muted text-muted-foreground",
        };

    return (
      <Badge variant="outline" className={`gap-1.5 ${config.className}`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const handleCancelSubmit = (values: CancelOrderRequestValue) => {
    cancelOrderMutation.mutate({
      orderId: orderId,
      reason: values.cancellationReason || "",
      interacEmail: values.interacEmail,
    });
  };

  const handleReviewSubmit: SubmitHandler<ReviewFormInput> = (values) => {
    const finalValues = {
      ...values,
      author: values.isAnonymous ? "Anonymous" : values.author,
    };

    createReviewMutation.mutate(finalValues);
  };

  if (!orderId) {
    return <p className="p-6">Loading order...</p>;
  }

  if (!data) {
    return (
      <div className="">
        <p className="">No data available for your order</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground text-balance">
              Order Details
            </h1>
            <p className="text-muted-foreground mt-1">
              Order #{data?.orderNumber}
            </p>
          </div>
          <div className="flex flex-col sm:items-end gap-2">
            {getStatusBadge(data.status as OrderStatus)}
            <p className="text-sm text-muted-foreground">
              {data.orderDate && formatDate(data.orderDate)}
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
              <CardTitle className="text-base">Billing Information</CardTitle>
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
              <CardTitle className="text-base">Shipping Address</CardTitle>
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
            <CardTitle className="text-base">Order Items</CardTitle>
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
                        {product.name}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-center text-muted-foreground">
                      {product.quantity}
                    </td>
                    <td className="py-4 px-2 text-right text-muted-foreground">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="py-4 px-2 text-right font-medium text-foreground">
                      ${(product.quantity * product.price).toFixed(2)}
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
                    {product.name}
                  </span>
                  <span className="font-medium text-foreground">
                    ${(product.quantity * product.price).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Qty: {product.quantity}</span>
                  <span>${product.price.toFixed(2)} each</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Order Summary & Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
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

      {/* Actions Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Order Actions</CardTitle>
          <CardDescription>Manage your order or leave feedback</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Cancel Order Button */}
            {data.canCancel && (
              <Dialog
                open={cancelDialogOpen}
                onOpenChange={(open) => {
                  setCancelDialogOpen(open);
                  if (!open) cancelForm.reset();
                }}
              >
                <DialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <XCircle className="size-4" />
                    Cancel Order
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cancel Order</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to cancel this order? This action
                      cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...cancelForm}>
                    <form
                      onSubmit={cancelForm.handleSubmit(handleCancelSubmit)}
                      className="space-y-4 py-2"
                    >
                      {/* Interac email — only shown when payment type is E-Transfer */}
                      {watchedPaymentType === "ETRANSFER" && (
                        <FormField
                          control={cancelForm.control}
                          name="interacEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Interac Email</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="your@email.com"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={cancelForm.control}
                        name="cancellationReason"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Reason for cancellation
                              <span className="text-muted-foreground font-normal ml-1">
                                (optional)
                              </span>
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Please let us know why you're cancelling..."
                                className="min-h-25"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCancelDialogOpen(false)}
                        >
                          Keep Order
                        </Button>
                        <Button type="submit" variant="destructive">
                          Confirm Cancellation
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}

            {/* Review Order Button */}
            {canReviewOrder() && (
              <Dialog
                open={reviewDialogOpen}
                onOpenChange={(open) => {
                  setReviewDialogOpen(open);
                  if (open && data?.products) {
                    reviewForm.reset({
                      orderId: orderId ?? "",
                      author: reviewForm.getValues("author"),
                      reviews: data.products.map((p) => ({
                        orderProductId: p.id,
                        rating: 0,
                        comment: "",
                      })),
                    });
                  } else if (!open) {
                    reviewForm.reset();
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button variant="default" className="gap-2">
                    <Star className="size-4" />
                    Leave a Review
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Review Your Order</DialogTitle>
                    <DialogDescription>
                      Share your experience with each product to help others.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...reviewForm}>
                    <form
                      onSubmit={reviewForm.handleSubmit(handleReviewSubmit)}
                      className="space-y-6 py-2"
                    >
                      {/* Author name — shared across all reviews */}
                      <FormField
                        control={reviewForm.control}
                        name="author"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Jane Doe"
                                {...field}
                                disabled={reviewForm.watch("isAnonymous")}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={reviewForm.control}
                        name="isAnonymous"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2">
                            <FormControl>
                              <Input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>Submit as anonymous</FormLabel>
                          </FormItem>
                        )}
                      />

                      <Separator />

                      {/* Per-product review fields */}
                      <div className="space-y-6">
                        {reviewFields.map((reviewField, index) => {
                          const productName =
                            data?.products[index]?.name ??
                            `Product ${index + 1}`;
                          const watchedRating = reviewForm.watch(
                            `reviews.${index}.rating`,
                          );
                          return (
                            <div
                              key={reviewField.id}
                              className="space-y-3 p-4 rounded-lg border border-border bg-muted/30"
                            >
                              <p className="font-medium text-sm text-foreground">
                                {productName}
                              </p>

                              {/* Star rating */}
                              <FormField
                                control={reviewForm.control}
                                name={`reviews.${index}.rating`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Rating</FormLabel>
                                    <FormControl>
                                      <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <Button
                                            key={star}
                                            type="button"
                                            onClick={() => field.onChange(star)}
                                            onMouseEnter={() =>
                                              setHoveredRating(index, star)
                                            }
                                            onMouseLeave={() =>
                                              clearHoveredRating(index)
                                            }
                                            className="p-1 transition-transform hover:scale-110 focus-visible:outline-none"
                                          >
                                            <Star
                                              className={`size-6 ${
                                                star <=
                                                ((hoveredRatings[index] ?? 0) ||
                                                  field.value)
                                                  ? "fill-amber-400 text-amber-400"
                                                  : "text-muted-foreground/30"
                                              }`}
                                            />
                                          </Button>
                                        ))}
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* Comment */}
                              <FormField
                                control={reviewForm.control}
                                name={`reviews.${index}.comment`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Your Review</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder={`Tell us about ${productName}...`}
                                        className="min-h-20"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          );
                        })}
                      </div>

                      <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setReviewDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createReviewMutation.isPending}
                        >
                          {createReviewMutation.isPending
                            ? "Submitting..."
                            : "Submit Reviews"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}

            {/* Show status message when actions are not available */}
            {!data.canCancel && !canReviewOrder() && (
              <p className="text-sm text-muted-foreground py-2">
                {data?.status === "CANCELLED"
                  ? "This order has been cancelled."
                  : data?.status === "CANCELLATION_REQUESTED"
                    ? "A cancellation has been requested for this order."
                    : NON_CANCELLABLE_STATUSES.includes(
                          data?.status as OrderStatus,
                        )
                      ? "This order is being processed and cannot be modified."
                      : "No actions available for this order."}
              </p>
            )}
          </div>

          {/* Cancellation time warning */}
          {data.canCancel && data.timeRemaining && (
            <div className="mt-4 flex items-center gap-2 text-sm text-amber-600 dark:text-amber-500">
              <Clock className="size-4" />
              <span>
                You can cancel this order within the next {data.timeRemaining}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

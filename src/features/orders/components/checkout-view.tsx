"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { adminEmail, shippingFee, taxRate } from "@/lib/constantData";
import { checkoutSchema, CheckoutSchema } from "@/lib/schemas/orderSchema";
import { OrderDetails, Product } from "@/lib/types";
import useCartStore, {
  useCartSubtotal,
  useCartTotal,
} from "@/stores/useCartStore";
import useOrderStore from "@/stores/useOrderStore";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export const CheckoutView = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [payment, setPayment] = useState(false);
  const [orderId, setOrderId] = useState<string>("");

  const { cartItems, clearCart } = useCartStore();
  const subtotal = useCartSubtotal();
  const total = useCartTotal();

  const tax = subtotal * (taxRate / 100);
  const shipping = shippingFee;

  const { addOrder, updateOrder, clearOrder } = useOrderStore();

  useEffect(() => {
    const tempOrderId = Date.now().toString();
    console.log("Temporary Order ID", tempOrderId);
    setOrderId(tempOrderId);
  }, []);

  const form = useForm<CheckoutSchema>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      address: "",
      city: "",
      postalCode: "",
      orderNotes: "",
      paymentStatus: false,
      referenceNumber: "",
    },
  });

  const sendVerificationEmail = useMutation(
    trpc.mail.sendEmail.mutationOptions({
      onSuccess: () => {
        toast.success("Order Placed", {
          description:
            "An email has been sent to the admin to confirm your payment.",
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

  const createOrder = useMutation(
    trpc.orders.placeOrder.mutationOptions({
      onSuccess: (data) => {
        toast.success("Order Placed", {
          description:
            "Your order has been placed successfully. We will verify your payment and get back to you shortly.",
        });

        if (data.success) {
          setOrderPlaced(true);
          clearCart();
          clearOrder();

          const order = data.order;

          if (order.status === "UNVERIFIED") {
            const emailData = {
              orderId: Number(order.orderId),
              customerName: `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`,
              paymentAmount: order.total,
              paymentDate: order.paymentDate
                ? order.paymentDate.toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0],
              paymentMethod: "Interac",
              referenceNumber: order.referenceNumber || "",
              verificationCode: order.verificationCode || "",
            };

            sendVerificationEmail.mutate({
              type: "verify_payment",
              to: adminEmail,
              ...emailData,
            });
          }
        }

        queryClient.invalidateQueries(
          trpc.orders.getPaginatedOrders.queryOptions({}),
        );
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

  //function to handle moving order data from local storage to db
  const handleUpdateOrderDB = async () => {
    // This function ensure that order details in local storage moves to DB: POST operation
    const storedOrder = localStorage.getItem("order-storage");

    if (storedOrder) {
      try {
        const parsedOrder = JSON.parse(storedOrder);
        const orderDetails = parsedOrder?.state?.orders?.[0];
        if (!orderDetails) {
          throw new Error("Invalid order details");
        }
        // Prepare the order data for the API
        const orderData = {
          id: orderDetails.id,
          paymentDate: orderDetails.paymentDate,
          products: orderDetails.products.map((product: Product) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: product.quantity,
          })),
          referenceNumber: orderDetails.referenceNumber,
          shippingFee: orderDetails.shippingFee,
          shippingInfo: orderDetails.shippingInfo,
          status: orderDetails.status || "UNVERIFIED",
          subtotal: orderDetails.subtotal,
          tax: orderDetails.tax,
          total: orderDetails.total,
          orderDate: orderDetails.orderDate,
          orderNumber: orderDetails.orderNumber,
          verificationCode: orderDetails.verificationCode,
        };

        const result = await createOrder.mutateAsync(orderData);
        return result.order;
      } catch (error) {
        console.error("Failed to add order to the database:", error);
        throw error;
      }
    } else {
      console.log("No order data found in local storage");
      throw new Error("No order data found in local storage");
    }
  };

  const onSubmit = async (values: CheckoutSchema) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit verification code
    const orderDetails = {
      id: orderId,
      products: cartItems,
      subtotal,
      tax,
      shippingFee: shipping,
      total,
      verificationCode: code,
      shippingInfo: { ...values },
      status: undefined,
    };
    // console.log("ORDER DEETS", orderDetails);

    // if there is no payment, add order details to local storage & set payment to true
    if (!payment) {
      await addOrder(orderDetails);
      setPayment(true);
    } else {
      // if payment === true, check for reference number
      const referenceNumber = values?.referenceNumber ?? "";
      if (referenceNumber) {
        // if there is reference number, update order details in local storage
        const updatedOrderDetails = await updateOrder(orderId, {
          orderNumber: `TEMP_ORD-${Math.floor(Math.random() * 1000000)}`,
          referenceNumber,
          paymentDate: new Date().toISOString().split("T")[0],
          orderDate: new Date().toISOString().split("T")[0],
        });

        // then move it to db, setOrderplace to true, clear the cart and order local storage
        const dbOrder = await handleUpdateOrderDB();
      } else {
        console.error("Reference number is required");
        toast.error("Reference number is required");
      }
    }
  };

  if (orderPlaced) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold">
                Order Confirmation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Thank you for your order! Your delicious Nigerian cuisine will
                be on its way as soon as your payment has been confirmed.
              </p>
              <p>
                You will receive a confirmation email with your order number and
                estimated delivery time.
              </p>
              <Button onClick={() => (window.location.href = "/")}>
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input type="tel" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a city" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Airdrie">Airdrie</SelectItem>
                                <SelectItem value="Calgary">Calgary</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Order Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="orderNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="Any special instructions for your order?"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <h4 className="font-semibold mb-2 mt-3">
                      Payment Instructions
                    </h4>
                    <p>
                      Make payment via your interac. Our interac mail is
                      villedishes@gmail.com
                    </p>
                  </CardContent>
                </Card>
                {payment && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="referenceNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reference Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                )}
                <Button type="submit" size="lg" className="w-full">
                  {payment ? "Place Order" : "Pay"}
                </Button>
              </form>
            </Form>
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center"
                    >
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <p>${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                  <div className="border-t pt-4">
                    <div className="flex justify-between">
                      <p>Subtotal</p>
                      <p>${subtotal.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between">
                      <p>Tax ({taxRate}%)</p>
                      <p>${tax.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between">
                      <p>Shipping Fee</p>
                      <p>${shipping.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between font-semibold text-lg mt-2">
                      <p>Total</p>
                      <p>${total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useCartStore from "@/stores/useCartStore";
import { adminEmail, shippingFee, taxRate } from "@/lib/constantData";
import useOrderStore from "@/stores/useOrderStore";
import { toast } from "sonner";

const baseSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(5, "Valid postal code is required"),
  orderNotes: z.string().optional(),
});

type FormValues = z.infer<typeof baseSchema> & { referenceNumber?: string };

export default function CheckoutPage() {
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [payment, setPayment] = useState(false);
  const [orderId, setOrderId] = useState<number>(0);

  const { cartItems, subtotal, total } = useCartStore();

  const tax = subtotal * (taxRate / 100);
  const shipping = shippingFee;

  const { addOrder, updateOrder } = useOrderStore();
  const { clearCart } = useCartStore();

  const [formSchema, setFormSchema] =
    useState<z.ZodType<FormValues>>(baseSchema);

  useEffect(() => {
    const tempOrderId = Date.now();
    setOrderId(tempOrderId);
  }, []);

  useEffect(() => {
    if (payment) {
      setFormSchema(
        baseSchema.extend({
          referenceNumber: z.string().min(1, "Reference number is required"),
        })
      );
    } else {
      setFormSchema(baseSchema);
    }
  }, [payment]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      address: "",
      city: "",
      postalCode: "",
      orderNotes: "",
      referenceNumber: "",
    },
  });

  const sendVerificationEmail = (orderDetails: OrderDetails) => {
    fetch("/api/emails/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: orderDetails.shippingInfo.email,
        to: adminEmail,
        subject: `VERIFY INTERAC PAYMENT FOR ${orderDetails.id}`,
        customerName: `${orderDetails.shippingInfo.firstName} ${orderDetails.shippingInfo.lastName}`,
        paymentAmount: orderDetails.total,
        paymentDate: orderDetails.paymentDate,
        referenceNumber: orderDetails.referenceNumber,
        verificationCode: orderDetails.verificationCode,
        orderId: orderDetails.id,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        toast.success("Order Placed", {
          description:
            "An email has been sent to the admin to confirm your payment.",
        });
        console.log("Email sent successfully:", data);
      })
      .catch((error) => {
        toast.error("Verification Failed", {
          description:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        });
        console.error("Error sending email:", error);
      });
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
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
    console.log("ORDER DEETS", orderDetails);
    if (!payment) {
      await addOrder(orderDetails);
      setPayment(true);
    } else {
      const referenceNumber = values?.referenceNumber ?? "";
      if (referenceNumber) {
        const updatedOrderDetails = await updateOrder(orderId, {
          referenceNumber,
          paymentDate: new Date().toISOString().split("T")[0],
        });
        setOrderPlaced(true);
        // Trigger email verification after order placement
        if (updatedOrderDetails && updatedOrderDetails?.status === "pending") {
          sendVerificationEmail(updatedOrderDetails);
        }

        // Clear cart after successful order placement
        clearCart();
      } else {
        console.error("Reference number is required");
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
                                <SelectItem value="airdrie">Airdrie</SelectItem>
                                <SelectItem value="calgary">Calgary</SelectItem>
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
}

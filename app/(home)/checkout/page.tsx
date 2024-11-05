"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useCartStore from "@/stores/useCartStore";

type CartItem = {
  id: number;
  name: string;
  quantity: number;
  price: number;
};

export default function CheckoutPage() {
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [payment, setPayment] = useState(false);

  const { cartItems, subtotal, total } = useCartStore();

  const tax = subtotal * 0.05; // Assuming 5% tax

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setOrderPlaced(true);
  };

  const handlePayment = (event: React.FormEvent) => {
    event.preventDefault();
    setPayment(true);
  };

  if (orderPlaced) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Order Confirmation</h1>
          <p className="mb-4">
            Thank you for your order! Your delicious Nigerian cuisine will be on
            its way as soon as your payment has been confirmed.
          </p>
          <p className="mb-4">
            You will receive a confirmation email with your order number and
            estimated delivery time.
          </p>
          <Button onClick={() => (window.location.href = "/")}>
            Return to Home
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <form onSubmit={handlePayment} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" required />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" required />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="state">City</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a city" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="airdrie">Airdrie</SelectItem>
                          <SelectItem value="calgary">Calgary</SelectItem>
                          {/* Add more states as needed */}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="zipCode">Postal Code</Label>
                      <Input id="zipCode" required />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Order Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Any special instructions for your order?"
                    className="resize-none"
                  />
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <h4 className="font-semibold mb-2">Payment Instructions</h4>
                  <p>
                    Make payment via your interac. Our interac mail is
                    villedishes@gmail.com
                  </p>
                </CardContent>
              </Card>
              {!payment && (
                <Button type="submit" size="lg" className="w-full">
                  Pay
                </Button>
              )}
            </form>

            {payment && (
              <form onSubmit={handleSubmit} className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label htmlFor="refNumber">Reference Number</Label>
                      <Input id="refNumber" required />
                    </div>
                  </CardContent>
                </Card>
                <Button type="submit" size="lg" className="w-full mt-4">
                  Place Order
                </Button>
              </form>
            )}
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
                      <p>Tax (5%)</p>
                      <p>${tax.toFixed(2)}</p>
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

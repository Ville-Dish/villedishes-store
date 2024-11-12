"use client";

import { FormEvent, useEffect, useState } from "react";
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
import useOrderStore from "@/stores/useOrderStore";
import { adminEmail } from "@/lib/constantData";

export default function VerifyPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyOrder } = useOrderStore();
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  useEffect(() => {
    const id = Number(searchParams.get("orderId")) || 0;
    setOrderId(id);
    if (!id) {
      toast.error("Order ID is missing");
    } else {
      console.log("Order ID:", id);
    }
  }, [searchParams]);

  const calculateEstimatedDelivery = (orderDate: string) => {
    const orderDateObj = new Date(orderDate);
    orderDateObj.setHours(orderDateObj.getHours() + 48);
    return orderDateObj.toISOString().split("T")[0];
  };

  const sendConfirmationEmail = async (orderDetails: OrderDetails) => {
    const estimatedDelivery = calculateEstimatedDelivery(
      orderDetails.orderDate ?? new Date().toISOString().split("T")[0]
    );

    console.log(
      `Sending verification email to ${orderDetails.shippingInfo.email}`
    );

    try {
      const response = await fetch("/api/emails/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: adminEmail,
          to: orderDetails.shippingInfo.email,
          subject: "ORDER CONFIRMATION",
          customerName: `${orderDetails.shippingInfo.firstName} ${orderDetails.shippingInfo.lastName}`,
          orderNumber: orderDetails.orderNumber,
          orderDate: orderDetails.orderDate,
          subtotal: orderDetails.subtotal,
          tax: orderDetails.tax,
          shippingFee: orderDetails.shippingFee,
          total: orderDetails.total,
          items: orderDetails.products,
          estimatedDelivery,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send email: ${response.statusText}`);
      }

      const data = await response.json();
      toast.success("Payment Verified", {
        description:
          "An email has been sent to the user confirming their payment.",
      });
      console.log("Email sent successfully:", data);
    } catch (error) {
      toast.error("Verification Failed", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
      console.error("Error sending email:", error);
    }
  };

  const handleVerify = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsVerifying(true);

    console.log("Handle Verify() invoked");

    try {
      if (!verificationCode.trim()) {
        throw new Error("Please enter a valid verification code");
      }
      if (orderId === null) {
        throw new Error("Order ID is missing");
      }
      console.log("Calling VerifyPending order");

      const verifiedOrder: OrderDetails | null = await verifyOrder(
        orderId,
        verificationCode
      );

      console.log("Called VerifyPending order");

      if (verifiedOrder) {
        console.log("Order verified:", verifiedOrder);
        await sendConfirmationEmail(verifiedOrder);
        setVerificationCode("");
        router.push(`/admin/success`);
      } else {
        throw new Error("Order verification failed.");
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Verification Failed", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Verify User Payment</CardTitle>
          </CardHeader>
          <form onSubmit={handleVerify}>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="verificationCode"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Verification Code
                  </label>
                  <Input
                    id="verificationCode"
                    type="text"
                    name="verificationCode"
                    placeholder="Enter verification code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isVerifying}>
                {isVerifying ? "Verifying..." : "Verify Payment"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}

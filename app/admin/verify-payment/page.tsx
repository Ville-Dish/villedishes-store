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
import { useSearchParams } from "next/navigation";
import useOrderStore from "@/stores/useOrderStore";

// Simulated function to send email
const sendVerificationEmail = async (email: string) => {
  console.log(`Sending verification email to ${email}`);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return true;
};

export default function VerifyPaymentPage() {
  const searchParams = useSearchParams();
  const { verifyPendingOrder } = useOrderStore();
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const orderId = Number(searchParams.get("orderId")); // Retrieve orderId from URL params

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    try {
      if (verificationCode.trim() === "") {
        throw new Error("Please enter a valid verification code");
      }

      // Call the verify function from Zustand store
      verifyPendingOrder(orderId, verificationCode);

      // Simulate sending an email to the user
      const emailSent = await sendVerificationEmail("user@example.com");

      if (emailSent) {
        toast.success("Payment Verified", {
          description:
            "An email has been sent to the user confirming their payment.",
        });
      } else {
        throw new Error("Failed to send verification email");
      }

      setVerificationCode("");
    } catch (error) {
      toast.error("Verification Failed", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (!orderId) {
      toast.error("Order ID is missing");
    }
  }, [orderId]);

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

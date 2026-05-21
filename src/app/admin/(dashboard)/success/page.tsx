import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const SuccessPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold uppercase text-center">
              Order Verified
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The payment has been verified and their order status has been
              updated to Verified.
            </p>
            <p>
              You can now view the order in your dashboard. An estimated
              delivery time of 48 hours has been sent to the customer. If the
              estimated delivery time changes, kindly contact the customer.
            </p>
            <Button asChild className="border-amber-200 bg-amber-400">
              <Link href="/admin/dashboard">Return to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SuccessPage;

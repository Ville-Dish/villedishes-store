import React from "react";
import { PageHeader } from "../../page-header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `Payments and Refunds | VilleDishes`,
  description:
    "Authentic Nigerian Food Delivered to Your Door. Experience the rich flavors of Nigeria with our delicious meals and desserts",
  openGraph: {
    title: `Payments and Refunds | VilleDishes`,
    description:
      "Authentic Nigerian Food Delivered to Your Door. Experience the rich flavors of Nigeria with our delicious meals and desserts",
    url: "https://villedishes.com",
    siteName: "VilleDishes",
    images: [
      "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1743187545/banner-bg_zsu5gn.png",
    ],
  },
};

const PaymentPolicy = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 container mx-auto px-4 py-8">
        <PageHeader
          title="Payment and Refund Policy"
          url="/policies/payment-policy"
        />
        <h1 className="text-3xl font-bold mb-6 text-center">
          Payment and Refund Policy
        </h1>
        <div className="space-y-4">
          <section>
            <h2 className="text-2xl font-semibold mb-2">1. Payment Methods</h2>
            <p>
              We accept payment via interac but we plan to include other payment
              methods including credit cards (Visa, MasterCard, American
              Express), PayPal, and local payment options. All payments are
              processed securely through our payment service providers.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-2">
              2. Pricing and Currency
            </h2>
            <p>
              All prices listed on our website are in Canadian Dollars (CAD) and
              are inclusive of applicable taxes. We reserve the right to change
              prices at any time without prior notice.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-2">
              3. Order Confirmation
            </h2>
            <p>
              Once your payment is successfully processed, you will receive an
              order confirmation email with your order details and estimated
              delivery time.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-2">4. Refund Policy</h2>
            <p>
              We strive to provide the best quality food and service. If you are
              not satisfied with your order, please contact us within 30 minutes
              of receiving your order. We will assess each situation on a
              case-by-case basis and may offer a refund, replacement, or store
              credit.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-2">
              5. Cancellation Policy
            </h2>
            <p>
              You may cancel your order for a full refund if the order has not
              yet been prepared. Once the order is in preparation or has been
              dispatched, cancellation and refund may not be possible.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-2">6. Delivery Issues</h2>
            <p>
              If there are issues with your delivery (e.g., significant delay,
              wrong items, or poor food quality), please contact us immediately.
              We will work to resolve the issue and may offer compensation or a
              refund as appropriate.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-2">7. Contact Us</h2>
            <p>
              If you have any questions about our Payment and Refund Policy,
              please contact our customer service team at villedishes@gmail.com
              or call us at +1 (587) 984-4409.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PaymentPolicy;

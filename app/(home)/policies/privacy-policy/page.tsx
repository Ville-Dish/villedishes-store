import { Metadata } from "next";
import { PageHeader } from "../../page-header";

export const metadata: Metadata = {
  title: `Privacy Policy | VilleDishes`,
  description:
    "Authentic Nigerian Food Delivered to Your Door. Experience the rich flavors of Nigeria with our delicious meals and desserts",
  openGraph: {
    title: `Privacy Policy | VilleDishes`,
    description:
      "Authentic Nigerian Food Delivered to Your Door. Experience the rich flavors of Nigeria with our delicious meals and desserts",
    url: "https://villedishes.com",
    siteName: "VilleDishes",
    images: [
      "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1743187545/banner-bg_zsu5gn.png",
    ],
  },
};

const PrivacyPolicy = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 container mx-auto px-4 py-8">
        <PageHeader title="Privacy Policy" url="/policies/privacy-policy" />
        <h1 className="text-3xl font-bold mb-6 text-center">Privacy Policy</h1>
        <div className="space-y-4">
          <section>
            <h2 className="text-2xl font-semibold mb-2">
              1. Information We Collect
            </h2>
            <p>
              We collect information you provide directly to us, such as when
              you create an account, place an order, or contact us for support.
              This may include your name, email address, phone number, and
              payment information.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-2">
              2. How We Use Your Information
            </h2>
            <p>
              We use the information we collect to provide, maintain, and
              improve our services, process transactions, send you technical
              notices and support messages, and respond to your comments and
              questions.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-2">
              3. Information Sharing and Disclosure
            </h2>
            <p>
              We do not share your personal information with third parties
              except as described in this policy. We may share your information
              with service providers who perform services on our behalf, such as
              payment processing and delivery services.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-2">4. Data Security</h2>
            <p>
              We take reasonable measures to help protect your personal
              information from loss, theft, misuse, unauthorized access,
              disclosure, alteration, and destruction.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-2">5. Your Choices</h2>
            <p>
              You may update, correct, or delete your account information at any
              time by logging into your online account or by contacting us. You
              may also opt out of receiving promotional communications from us
              by following the instructions in those messages.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-2">
              6. Changes to this Policy
            </h2>
            <p>
              We may change this privacy policy from time to time. If we make
              significant changes, we will notify you through the email address
              specified in your account or by posting a notice on our website.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-2">7. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us at villedishes@gmail.com.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;

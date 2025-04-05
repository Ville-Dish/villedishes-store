import { Metadata } from "next";
import { PageHeader } from "../../page-header";

export const metadata: Metadata = {
  title: `Terms of Service | VilleDishes`,
  description:
    "Authentic Nigerian Food Delivered to Your Door. Experience the rich flavors of Nigeria with our delicious meals and desserts",
  openGraph: {
    title: `Terms of Service | VilleDishes`,
    description:
      "Authentic Nigerian Food Delivered to Your Door. Experience the rich flavors of Nigeria with our delicious meals and desserts",
    url: "https://villedishes.com",
    siteName: "VilleDishes",
    images: [
      "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1743187545/banner-bg_zsu5gn.png",
    ],
  },
};

const TermsOfService = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 container mx-auto px-4 py-8">
        <PageHeader title="Terms of Services" url="/policies/terms-of-policy" />
        <h1 className="text-3xl font-bold mb-6 text-center">
          Terms of Service
        </h1>
        <div className="space-y-4">
          <section>
            <h2 className="text-2xl font-semibold mb-2">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using Villedishes&apos; services, you agree to be
              bound by these Terms of Service. If you do not agree to these
              terms, please do not use our services.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-2">2. Use of Service</h2>
            <p>
              You agree to use Villedishes&apos; services only for lawful
              purposes and in accordance with these Terms. You are prohibited
              from violating or attempting to violate the security of the
              website.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-2">3. User Accounts</h2>
            <p>
              You may be required to create an account to use certain features
              of our service. You are responsible for maintaining the
              confidentiality of your account information.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-2">
              4. Intellectual Property
            </h2>
            <p>
              All content on the Villedishes website, including text, graphics,
              logos, and software, is the property of Villedishes and protected
              by copyright laws.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-2">
              5. Limitation of Liability
            </h2>
            <p>
              Villedishes shall not be liable for any indirect, incidental,
              special, consequential or punitive damages resulting from your use
              of our services.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-2">6. Changes to Terms</h2>
            <p>
              Villedishes reserves the right to modify these Terms of Service at
              any time. We will notify users of any significant changes.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-2">7. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with
              the provincial laws of Alberta and the laws of Canada , without
              regard to its conflict of law provisions.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default TermsOfService;

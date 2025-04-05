import React from "react";
import { PageHeader } from "../page-header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `About | Nigerian Restaurant near you - Updated ${new Date().getFullYear()}`,
  description:
    "Authentic Nigerian Cuisine Delivered to Your Door. Experience the rich flavors of Nigeria with our delicious meals and desserts",
  openGraph: {
    title: `About | Nigerian Restaurant near you - Updated ${new Date().getFullYear()}`,
    description:
      "Authentic Nigerian Cuisine Delivered to Your Door. Experience the rich flavors of Nigeria with our delicious meals and desserts",
    url: "https://villedishes.com",
    siteName: "VilleDishes",
    images: [
      "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1743187545/banner-bg_zsu5gn.png",
    ],
  },
};

const About = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 container mx-auto px-4 py-8">
        <PageHeader title="About Us" url="/about" />
        <section className="w-full py-8 md:py-12 lg:py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">
              About Villedishes
            </h1>
            <div className="space-y-6 text-base sm:text-lg">
              <p className="text-gray-700 dark:text-gray-300">
                Villedishes was born out of a passion for sharing authentic
                Nigerian cuisine with our community. Our founder, inspired by
                family recipes and a love for cooking, started this business to
                bring the rich, diverse flavors of Nigeria to your table.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                We&apos;re committed to using the freshest ingredients and
                traditional cooking methods to deliver an unforgettable dining
                experience. Our team of skilled chefs brings years of expertise
                in Nigerian cuisine, ensuring that every dish is prepared with
                care and authenticity.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                At Villedishes, we believe that food is more than just
                sustenance - it&apos;s a way to connect with culture, create
                memories, and bring people together. We&apos;re proud to serve
                our community and introduce the vibrant flavors of Nigeria to
                food lovers everywhere.
              </p>
            </div>
          </div>
        </section>
        <section className="w-full py-8 md:py-12 lg:py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl text-center mb-6">
              From Our Founder
            </h2>
            <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg mb-6">
              Dolapo Ajuwon is the visionary founder behind VilleDishes, a
              Nigerian restaurant dedicated to bringing authentic flavors of
              Nigeria to diners. With a deep-rooted philosophy of &apos;bringing
              the taste of home to you&apos; Ajuwon has created a culinary space
              that serves as a bridge between traditional Nigerian cuisine and
              those seeking to experience it.
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg mb-6">
              At VilleDishes, Dolapo has curated a menu showcasing beloved
              Nigerian classics. The restaurant has become known for its
              signature dishes, including perfectly spiced Jollof rice,
              flavorful fried rice, traditional Amala (a soft dough made from
              yam flour), and the sweet, crunchy snack chin-chin, puff-puff,
              Zobo drinks, and many more.
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg mb-6">
              Through VilleDishes, Dolapo shares not just Nigerian food but also
              the cultural significance behind each dish, creating an immersive
              dining experience that resonates with both Nigerians longing for
              familiar tastes and newcomers eager to explore West African
              cuisine. The restaurant stands as a testament to Dolapo&apos;s
              commitment to preserving and celebrating Nigeria&apos;s rich
              culinary heritage.
            </p>
            <div className="text-center">
              <h4 className="text-xl font-semibold">Chef Dolapo</h4>
              <h6 className="text-sm text-gray-600 dark:text-gray-400 italic">
                Founder
              </h6>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;

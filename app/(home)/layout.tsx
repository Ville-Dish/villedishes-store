import type { Metadata } from "next";
import { Footer } from "@/components/custom/footer";
import { Header } from "@/components/custom/header";

export const metadata: Metadata = {
  title: `Authentic Nigerian Restaurant near you - Updated ${new Date().getFullYear()}`,
  description:
    "Authentic Nigerian Cuisine Delivered to Your Door. Experience the rich flavors of Nigeria with our delicious meals and desserts",
  keywords: [
    "Nigerian Restaurant",
    "Nigerian Food",
    "Nigerian Cuisine",
    "Nigerian Restaurant near me",
    "Nigerian Food near me",
    "Top Nigerian Restaurant",
  ],
  openGraph: {
    title: `Authentic Nigerian Cuisine near you - Updated ${new Date().getFullYear()}`,
    description:
      "Authentic Nigerian Cuisine Delivered to Your Door. Experience the rich flavors of Nigeria with our delicious meals and desserts",
    url: "https://villedishes.com",
    siteName: "VilleDishes",
    images: [
      "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1743187545/banner-bg_zsu5gn.png",
    ],
  },
};

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="min-h-screen flex flex-col justify-between overflow-auto">
        <Header show />
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
    </>
  );
}

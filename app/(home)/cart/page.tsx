import { Metadata } from "next";
import { CartContent } from "./CartContent";

export const metadata: Metadata = {
  title: `Cart | VilleDishes`,
  description:
    "Authentic Nigerian Food Delivered to Your Door. Experience the rich flavors of Nigeria with our delicious meals and desserts",
  openGraph: {
    title: `Cart | VilleDishes`,
    description:
      "Authentic Nigerian Food Delivered to Your Door. Experience the rich flavors of Nigeria with our delicious meals and desserts",
    url: "https://villedishes.com",
    siteName: "VilleDishes",
    images: [
      "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1743187545/banner-bg_zsu5gn.png",
    ],
  },
};

export default function CartPage() {
  return <CartContent />;
}

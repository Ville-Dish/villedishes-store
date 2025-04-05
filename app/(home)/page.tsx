import { Metadata } from "next";
import { HomeContent } from "./home-content";

export const metadata: Metadata = {
  title: `Authentic Nigerian Restaurant near you - Updated ${new Date().getFullYear()}`,
  description: "Authentic Nigerian Cuisine Delivered to Your Door. Experience the rich flavors of Nigeria with our delicious meals and desserts",
  openGraph: {
    title: `Authentic Nigerian Cuisine near you - Updated ${new Date().getFullYear()}`,
    description: "Authentic Nigerian Cuisine Delivered to Your Door. Experience the rich flavors of Nigeria with our delicious meals and desserts",
    url: "https://villedishes.com",
    siteName: "VilleDishes",
    images: [
      "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1743187545/banner-bg_zsu5gn.png"
    ]
  }
}

export default function Home() {

  return (
    <HomeContent />
  );
}

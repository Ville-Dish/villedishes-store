import { Metadata } from "next";
import { ProductContent } from "./product-content";

export const revalidate = 86400; // 24 hrs

export const generateStaticParams = async () => {
  return [];
};

export const metadata: Metadata = {
  title: `Delicious Nigerian Food near you - Updated ${new Date().getFullYear()}`,
  description:
    "Authentic Nigerian Cuisine Delivered to Your Door. Experience the rich flavors of Nigeria with our delicious meals and desserts",
  openGraph: {
    title: `Delicious Nigerian Food near you - Updated ${new Date().getFullYear()}`,
    description:
      "Authentic Nigerian Cuisine Delivered to Your Door. Experience the rich flavors of Nigeria with our delicious meals and desserts",
    url: "https://villedishes.com",
    siteName: "VilleDishes",
    images: [
      "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1743187546/product-banner-bg_qzyrx1.png",
    ],
  },
};

const ProductPage = () => {
  return <ProductContent />;
};

export default ProductPage;

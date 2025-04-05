import { Metadata } from "next";
import { ContactContent } from "./ContactContent";

export const metadata: Metadata = {
  title: `Contact | VilleDishes`,
  description:
    "Authentic Nigerian Food Delivered to Your Door. Experience the rich flavors of Nigeria with our delicious meals and desserts",
  openGraph: {
    title: `Contact | VilleDishes`,
    description:
      "Authentic Nigerian Food Delivered to Your Door. Experience the rich flavors of Nigeria with our delicious meals and desserts",
    url: "https://villedishes.com",
    siteName: "VilleDishes",
    images: [
      "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1743187545/banner-bg_zsu5gn.png",
    ],
  },
};

const Contact = () => {
  return <ContactContent />;
};

export default Contact;

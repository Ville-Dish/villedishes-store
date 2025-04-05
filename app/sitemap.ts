import { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

const weeklyPages = [
  "/",
  "/products",
  "/admin/dashboard",
  "/admin/invoices",
  "/admin/orders",
  "/admin/products",
  "/admin/settings",
  "/admin/success",
  "/admin/verify-payment",
];

const yearlyPages = [
  "/about",
  "/contact",
  "/faq",
  "/cart/",
  "/checkout/",
  "/login/",
];

const allPages = [...weeklyPages, ...yearlyPages];

export default function sitemap(): MetadataRoute.Sitemap {
  return allPages.map((q) => {
    if (yearlyPages.includes(q)) {
      return {
        url: `${baseUrl}${q}`,
        changeFrequency: "yearly",
        priority: 0.8,
        images: [
          "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1743187545/banner-bg_zsu5gn.png",
        ],
      };
    } else {
      return {
        url: `${baseUrl}${q}`,
        changeFrequency: "weekly",
        priority: 1,
        images: [
          "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1743187545/banner-bg_zsu5gn.png",
        ],
      };
    }
  });
}

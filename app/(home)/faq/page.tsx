import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqItems } from "@/lib/faq";
import { PageHeader } from "../page-header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `FAQ | VilleDishes`,
  description:
    "Authentic Nigerian Cuisine Delivered to Your Door. Experience the rich flavors of Nigeria with our delicious meals and desserts",
  openGraph: {
    title: `FAQ | VilleDishes`,
    description:
      "Authentic Nigerian Cuisine Delivered to Your Door. Experience the rich flavors of Nigeria with our delicious meals and desserts",
    url: "https://villedishes.com",
    siteName: "VilleDishes",
    images: [
      "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1743187546/product-banner-bg_qzyrx1.png",
    ],
  },
};

const FAQ = () => {
  return (
    <div className="flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8">
        <PageHeader title="FAQ" url="/faq" />
        <h1 className="text-3xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h1>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-lg font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-base sm:text-lg">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </main>
    </div>
  );
};

export default FAQ;

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Props = {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  extraCtaText?: string;
  extraCtaLink?: string;
  backgroundImage: string;
};

export const Banner = ({
  title,
  subtitle,
  ctaText,
  ctaLink,
  extraCtaText,
  extraCtaLink,
  backgroundImage,
}: Props) => {
  return (
    <section
      className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-white bg-black bg-opacity-50 p-4 rounded-lg">
              {title}
            </h1>
            <p className="mx-auto max-w-[700px] text-white text-xl md:text-2xl bg-black bg-opacity-50 p-4 rounded-lg">
              {subtitle}
            </p>
          </div>
          <div className="flex gap-2">
            {/* CTA 1 */}
          <Link href={ctaLink}>
            <Button
              className="bg-[#fd9d1c] text-black hover:bg-[#fd9e1d]"
              size="lg"
            >
              {ctaText}
            </Button>
          </Link>
            {/* CTA 2 */}
            {extraCtaLink && extraCtaText && (
          <Link href={extraCtaLink}>
            <Button
              className="bg-[#fd9d1c] text-black hover:bg-[#fd9e1d]"
              size="lg"
            >
              {extraCtaText}
            </Button>
          </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

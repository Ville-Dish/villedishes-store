import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";

type Props = {
  title: string;
  url: string;
};

export const PageHeader = ({ title, url }: Props) => {
  const hideTitle = [
    "Terms of Services",
    "Contact Us",
    "Privacy Policy",
    "Payment and Refund Policy",
  ].includes(title);

  return (
    <div className="flex flex-col justify-center items-center py-2">
      {!hideTitle && (
        <h1 className="text-3xl font-bold text-center">{title}</h1>
      )}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={url}>{title}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

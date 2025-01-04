import React from "react";
import { Section, Text } from "@react-email/components";

type Props = {
  variant: "contact" | "order" | "payment";
};

export const EmailFooter = ({ variant }: Props) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  // Define the dynamic text based on the variant
  const dynamicText = (() => {
    switch (variant) {
      case "contact":
        return "You can reply this mail to directly respond to the customer.";
      case "order":
        return "Do not reply to this mail. If you have any concerns about the order, use our contact form on the website to log your complain or email us directly on villedishes@gmail.com";
      case "payment":
        return "Do not reply to this mail. If you have any concerns about the payment, check your admin dashboard with the order id and verification code to get customer details or contact admin.";
      default:
        return "This is an automated message. Please do not reply to this email.";
    }
  })();

  return (
    <Section
      style={{
        backgroundColor: "#fff1e2",
        color: "white",
        padding: "20px",
        fontSize: "0.8em",
        textAlign: "center",
      }}
    >
      <Text className="text-slate-700">
        &copy; {currentYear} Villedishes. All rights reserved.
      </Text>
      <Text className="text-slate-700">{dynamicText}</Text>
      <Text className="text-slate-700">
        Email: villedishes@gmail.com | Phone: +1 (555) 789-4429
      </Text>
    </Section>
  );
};

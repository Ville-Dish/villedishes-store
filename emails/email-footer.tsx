import React from "react";
import { Section, Text } from "@react-email/components";

export const EmailFooter = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  return (
    <Section
      style={{
        backgroundColor: "#4a5568",
        color: "white",
        padding: "20px",
        fontSize: "0.8em",
        textAlign: "center",
      }}
    >
      <Text>&copy; {currentYear} Villedishes. All rights reserved.</Text>
      <Text>
        This is an automated message. Please do not reply to this email.
      </Text>
      <Text>Email: villedishes@gmail.com | Phone: +1 (555) 789-4429</Text>
    </Section>
  );
};

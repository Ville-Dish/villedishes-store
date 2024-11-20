import React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Section,
  Hr,
  Tailwind,
} from "@react-email/components";
import { EmailFooter } from "./email-footer";
import { EmailHeader } from "./email-header";
import { demoItems } from "@/lib/constantData";

type InvoiceEmailProps = {
  customerName: string;
  invoiceNumber: string;
};

const InvoiceTemplate = ({
  customerName,
  invoiceNumber,
}: InvoiceEmailProps) => {
  customerName = customerName || "John Doe";
  invoiceNumber = invoiceNumber || "INV-00000";
  const previewText = `Invoice ${invoiceNumber} for ${customerName} Available`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white text-gray-800 font-sans">
          <Container className="max-w-600px mx-auto">
            <Section className="bg-white p-6 rounded-lg shadow-md">
              <EmailHeader />
              <Section className="mt-6">
                <Heading className="text-3xl font-bold uppercase mb-4 text-center">
                  Invoice Available
                </Heading>
                <Text className="text-lg mb-4">
                  Thank you for your order and inquiry, {customerName}! Your
                  invoice with number {invoiceNumber} is ready and has been
                  attached to this mail. Kindly make payment by the due date to
                  avoid any late charges.
                </Text>
              </Section>

              <Hr className="border-gray-300 my-6" />

              <Section className="mt-6 text-center">
                <Text className="text-base mb-4">
                  If you have any questions, please contact our customer support
                  team.
                </Text>
                <Text className="text-base font-semibold">
                  Thank you for choosing Villedishes. We hope you enjoy your
                  meal!
                </Text>
              </Section>

              <EmailFooter variant="order" />
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default InvoiceTemplate;

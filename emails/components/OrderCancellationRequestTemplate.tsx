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

type OrderCanacellationRequestEmailProps = {
  customerName: string;
  customerInteracEmail: string;
  orderNumber: string;
  orderDate: string;
  total: number;
};

const OrderCancellationRequestTemplate = ({
  customerName,
  customerInteracEmail,
  orderNumber,
  orderDate,
  total,
}: OrderCanacellationRequestEmailProps) => {
  customerName = customerName || "John Doe";
  customerInteracEmail = customerInteracEmail || "john.doe@example.com";
  orderNumber = orderNumber || "ORD-00000";
  orderDate = orderDate || "2023-03-01";
  total = total || 0.0;

  const previewText = `Request to cancel Order ${orderNumber}`;

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
                  Order Cancellation
                </Heading>
                <Text className="text-lg mb-4">Hello VilleDishes,</Text>
                <Text className="text-base mb-4">
                  {customerName} has requested that their order {orderNumber}{" "}
                  made on {orderDate} be cancelled.
                </Text>
                <Text className="text-base mb-4">
                  Kindly log on to your dashboard and change the status to
                  Cancelled once you have refunded the fee of $ {total} to the
                  client. The customer&apos;s interac is {customerInteracEmail}
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

export default OrderCancellationRequestTemplate;

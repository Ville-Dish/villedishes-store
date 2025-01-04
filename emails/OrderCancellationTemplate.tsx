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
  Link,
} from "@react-email/components";
import { EmailFooter } from "./email-footer";
import { EmailHeader } from "./email-header";

type OrderCancellationEmailProps = {
  customerName: string;
  orderNumber: string;
  orderDate?: string;
  subtotal?: number;
  tax?: number;
  shippingFee?: number;
  total?: number;
  items?: Product[];
  estimatedDelivery?: string;
};

const OrderFulfillmentTemplate = ({
  customerName,
  orderNumber,
  total,
}: OrderCancellationEmailProps) => {
  customerName = customerName || "John Doe";
  orderNumber = orderNumber || "ORD-00000";
  total = total || 57.21;
  const previewText = `Order with number ${orderNumber} has been cancelled`;

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
                  Order Fulfillment
                </Heading>
                <Text className="text-lg mb-4">
                  We are sorry to see your order go, {customerName}! Your order
                  has been cancelled per your request and your refund of $
                  {total} is being processed. We will like to know why your
                  order was cancelled.
                </Text>
              </Section>

              <Hr className="border-gray-300 my-6" />
              <Section className="text-center">
                <Text className="text-lg mb-4">
                  Let us know why you requested this cancellation. Click the
                  button below to leave us a message via our contact form.
                </Text>
                <Link
                  href="/"
                  className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-md font-bold text-base no-underline inline-block transition-colors duration-300"
                >
                  Leave a Message
                </Link>
                <Hr className="border-gray-300 my-6" />
              </Section>

              <EmailFooter variant="order" />
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default OrderFulfillmentTemplate;

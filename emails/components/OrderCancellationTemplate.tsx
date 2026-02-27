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
  Button,
} from "@react-email/components";
import { EmailFooter } from "./email-footer";
import { EmailHeader } from "./email-header";

type OrderCancellationEmailProps = {
  customerName: string;
  orderNumber: string;
  total?: number;
  feedbackLink?: string;
};

const OrderCancellationTemplate = ({
  customerName,
  orderNumber,
  total,
  feedbackLink,
}: OrderCancellationEmailProps) => {
  const displayName =
    typeof customerName === "string" ? customerName : "John Doe";
  const displayOrderNumber =
    typeof orderNumber === "string" ? orderNumber : "ORD-00000";
  const displayTotal =
    typeof total === "number" && Number.isFinite(total) ? total : 57.21;
  const displayFeedbackLink =
    typeof feedbackLink === "string" && feedbackLink.trim() !== ""
      ? feedbackLink
      : "http://localhost:3000";
  const previewText = `Order with number ${displayOrderNumber} has been cancelled`;

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
                <Text className="text-lg mb-4">
                  We are sorry to see your order go, {displayName}! Your order
                  has been cancelled per your request and your refund of $
                  {displayTotal} is being processed. We will like to know why
                  your order was cancelled.
                </Text>
              </Section>

              <Hr className="border-gray-300 my-6" />
              <Section className="text-center">
                <Text className="text-lg mb-4">
                  Let us know why you requested this cancellation. Click the
                  button below to leave us a message via our contact form.
                </Text>
                <Link
                  href={displayFeedbackLink}
                  className="bg-green-500 text-white py-3 px-6 rounded-md font-bold text-base no-underline inline-block transition-colors duration-300"
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

export default OrderCancellationTemplate;

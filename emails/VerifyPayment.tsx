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
  Link,
  Tailwind,
  Column,
  Row,
} from "@react-email/components";
import { EmailFooter } from "./email-footer";
import { EmailHeader } from "./email-header";

type VerifyPaymentAdminEmailProps = {
  customerName: string;
  paymentAmount: number;
  paymentDate: string;
  paymentMethod?: string;
  referenceNumber: string;
  verificationCode: string;
  orderId: number;
  verificationLink?: string;
};

export const VerifyPaymentTemplate = ({
  customerName,
  paymentAmount,
  paymentDate,
  paymentMethod,
  referenceNumber,
  verificationCode,
  orderId,
  verificationLink,
}: VerifyPaymentAdminEmailProps) => {
  const previewText = `Verify Payment for New Order`;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  customerName = customerName || "John Doe";
  paymentAmount = paymentAmount || 0.0;
  paymentDate = paymentDate || "2023-11-04";
  paymentMethod = "Interac";
  referenceNumber = referenceNumber || "A0AaBCdE12FG";
  verificationCode = verificationCode || "000000";
  orderId = orderId || 1234567890;
  verificationLink = `${
    verificationLink || `${baseUrl}/admin/verify-payment`
  }?orderId=${orderId}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="max-w-600px mx-auto">
            <Section className="bg-white p-8 rounded-lg shadow-md">
              <EmailHeader />
              <Heading className="text-2xl font-bold text-center text-gray-800 mb-6">
                Verify Interac Payment
              </Heading>
              <Text className="text-base text-gray-600 text-center mb-4">
                A new Interac payment requires verification for the following
                order:
              </Text>
              <Section className="mb-6 text-center">
                <Text className="text-lg text-gray-700 font-bold">
                  Customer Name: {customerName}
                </Text>
              </Section>

              <Section className="w-full max-w-500px mx-auto mb-8">
                <Heading
                  as="h3"
                  className="text-xl font-semibold text-gray-800 text-center mb-4"
                >
                  Payment Details
                </Heading>
                <Row className="bg-gray-200">
                  <Column className="p-3 text-right">
                    <Text className="text-sm font-semibold text-gray-700 m-0">
                      Amount Paid
                    </Text>
                  </Column>
                  <Column className="p-3 text-right">
                    <Text className="text-sm font-semibold text-gray-700 m-0">
                      Payment Date
                    </Text>
                  </Column>
                  <Column className="p-3 text-right">
                    <Text className="text-sm font-semibold text-gray-700 m-0">
                      Payment Method
                    </Text>
                  </Column>
                  <Column className="p-3 text-right">
                    <Text className="text-sm font-semibold text-gray-700 m-0">
                      Reference Number
                    </Text>
                  </Column>
                </Row>
                <Row className="bg-gray-50">
                  <Column className="p-3 text-right">
                    <Text className="text-sm text-gray-700 m-0">
                      ${paymentAmount.toFixed(2)}
                    </Text>
                  </Column>
                  <Column className="p-3 text-right">
                    <Text className="text-sm text-gray-700 m-0">
                      {paymentDate}
                    </Text>
                  </Column>
                  <Column className="p-3 text-right">
                    <Text className="text-sm text-gray-700 m-0">
                      {paymentMethod}
                    </Text>
                  </Column>
                  <Column className="p-3 text-right">
                    <Text className="text-sm text-gray-700 m-0">
                      {referenceNumber}
                    </Text>
                  </Column>
                </Row>
              </Section>

              <Hr className="border-t border-gray-300 my-6" />

              <Section className="mb-6">
                <Text className="text-base text-gray-600 text-center mb-4">
                  To verify this payment, use the following verification code:
                </Text>
                <Text className="bg-gray-100 py-4 px-6 text-2xl font-bold text-center text-gray-800 rounded-md mb-6">
                  {verificationCode}
                </Text>
                <Text className="text-base text-gray-600 text-center mb-4">
                  Click the button below to go to the admin panel to verify the
                  payment:
                </Text>
                <Section className="text-center">
                  <Link
                    href={verificationLink}
                    className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-md font-bold text-base no-underline inline-block transition-colors duration-300"
                  >
                    Verify Payment
                  </Link>
                </Section>
              </Section>

              <Hr className="border-t border-gray-300 my-6" />

              <Text className="text-sm text-gray-600 text-center">
                If you have any concerns about this payment, please contact the
                IT department immediately.
              </Text>
              <EmailFooter variant="payment" />
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default VerifyPaymentTemplate;

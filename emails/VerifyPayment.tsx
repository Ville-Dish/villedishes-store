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

interface VerifyPaymentAdminEmailProps {
  orderNumber: string;
  customerName: string;
  paymentAmount: number;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber: string;
  verificationCode: string;
  verificationLink: string;
}

export const VerifyPaymentTemplate: React.FC<VerifyPaymentAdminEmailProps> = ({
  orderNumber,
  customerName,
  paymentAmount,
  paymentDate,
  paymentMethod,
  referenceNumber,
  verificationCode,
  verificationLink,
}) => {
  const previewText = `Verify Payment for Order ${orderNumber}`;
  orderNumber = orderNumber || "ORD-00000";
  customerName = customerName || "John Doe";
  paymentAmount = paymentAmount || 0.0;
  paymentDate = paymentDate || "2023-11-04";
  paymentMethod = paymentMethod || "Interac";
  referenceNumber = referenceNumber || "A0AaBCdE12FG";
  verificationCode = verificationCode || "000000";
  verificationLink =
    verificationLink || "http://localhost:3000/admin/verify-payment";

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
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-3 text-left text-sm font-semibold text-gray-700">
                        Order Number
                      </th>
                      <th className="p-3 text-right text-sm font-semibold text-gray-700">
                        Amount Paid
                      </th>
                      <th className="p-3 text-right text-sm font-semibold text-gray-700">
                        Payment Date
                      </th>
                      <th className="p-3 text-right text-sm font-semibold text-gray-700">
                        Payment Method
                      </th>
                      <th className="p-3 text-right text-sm font-semibold text-gray-700">
                        Reference Number
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-50">
                      <td className="p-3 text-sm text-gray-700">
                        {orderNumber}
                      </td>
                      <td className="p-3 text-sm text-gray-700 text-right">
                        ${paymentAmount.toFixed(2)}
                      </td>
                      <td className="p-3 text-sm text-gray-700 text-right">
                        {paymentDate}
                      </td>
                      <td className="p-3 text-sm text-gray-700 text-right">
                        {paymentMethod}
                      </td>
                      <td className="p-3 text-sm text-gray-700 text-right">
                        {referenceNumber}
                      </td>
                    </tr>
                  </tbody>
                </table>
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
              <EmailFooter />
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default VerifyPaymentTemplate;

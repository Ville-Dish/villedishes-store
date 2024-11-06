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
  Row,
  Column,
} from "@react-email/components";
import { EmailFooter } from "./email-footer";
import { EmailHeader } from "./email-header";
import { demoItems } from "@/lib/constantData";

interface OrderConfirmationEmailProps {
  customerName: string;
  orderNumber: string;
  orderDate: string;
  subTotalAmount: number;
  tax: number;
  shipping: number;
  totalAmount: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  estimatedDelivery: string;
}

const OrderConfirmationTemplate: React.FC<OrderConfirmationEmailProps> = ({
  customerName,
  orderNumber,
  orderDate,
  subTotalAmount,
  tax,
  shipping,
  totalAmount,
  items,
  estimatedDelivery,
}) => {
  const previewText = `Order Confirmation for ${customerName}`;
  customerName = customerName || "John Doe";
  orderNumber = orderNumber || "ORD-00000";
  orderDate = orderDate || "2023-03-01";
  subTotalAmount = subTotalAmount || 0.0;
  tax = tax || 0.0;
  shipping = shipping || 0.0;
  totalAmount = totalAmount || 0.0;
  items = items || demoItems;
  estimatedDelivery = estimatedDelivery || "2023-03-05";

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
                  Order Confirmation
                </Heading>
                <Text className="text-lg mb-4">
                  Thank you for your order, {customerName}! Your payment has
                  been confirmed and your order is being processed.
                </Text>
                <Heading
                  as="h3"
                  className="text-xl font-semibold uppercase mb-2 text-center"
                >
                  Order Details
                </Heading>
                <Text className="text-base mb-1 text-center">
                  Order Number: {orderNumber}
                </Text>
                <Text className="text-base mb-1 text-center">
                  Order Date: {orderDate}
                </Text>
                <Text className="text-base mb-4 text-center">
                  Estimated Delivery: {estimatedDelivery}
                </Text>
              </Section>

              <Hr className="border-gray-300 my-6" />

              <Section className="w-full max-w-500px mx-auto">
                <Heading
                  as="h3"
                  className="text-xl font-semibold uppercase text-center mb-4"
                >
                  Items Ordered
                </Heading>
                <Row className="bg-gray-200 text-gray-700 font-bold">
                  <Column className="p-3 w-1/2">Menu</Column>
                  <Column className="p-3 w-1/4 text-center">Quantity</Column>
                  <Column className="p-3 w-1/4 text-right">Price</Column>
                </Row>
                {items.map((item, index) => (
                  <Row
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <Column className="p-3 w-1/2">{item.name}</Column>
                    <Column className="p-3 w-1/4 text-center">
                      {item.quantity}
                    </Column>
                    <Column className="p-3 w-1/4 text-right">
                      ${item.price.toFixed(2)}
                    </Column>
                  </Row>
                ))}

                <Hr className="border-gray-300 my-4" />
                <Section className="w-full max-w-300px ml-auto">
                  <Row className="text-right">
                    <Column className="w-1/2"></Column>
                    <Column className="w-1/4 p-2 font-semibold">
                      Subtotal
                    </Column>
                    <Column className="w-1/4 p-2">
                      ${subTotalAmount.toFixed(2)}
                    </Column>
                  </Row>
                  <Row className="text-right">
                    <Column className="w-1/2"></Column>
                    <Column className="w-1/4 p-2 font-semibold">Tax</Column>
                    <Column className="w-1/4 p-2">${tax.toFixed(2)}</Column>
                  </Row>
                  <Row className="text-right">
                    <Column className="w-1/2"></Column>
                    <Column className="w-1/4 p-2 font-semibold">
                      Shipping
                    </Column>
                    <Column className="w-1/4 p-2">
                      ${shipping.toFixed(2)}
                    </Column>
                  </Row>
                  <Hr className="border-gray-300 my-2" />
                  <Row className="text-right font-bold">
                    <Column className="w-1/2"></Column>
                    <Column className="w-1/4 p-2">Total</Column>
                    <Column className="w-1/4 p-2">
                      ${totalAmount.toFixed(2)}
                    </Column>
                  </Row>
                </Section>
              </Section>

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

              <EmailFooter />
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default OrderConfirmationTemplate;

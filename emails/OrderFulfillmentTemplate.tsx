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
  Link,
} from "@react-email/components";
import { EmailFooter } from "./email-footer";
import { EmailHeader } from "./email-header";
import { demoItems } from "@/lib/constantData";

type OrderFulfillmentEmailProps = {
  customerName: string;
  orderNumber: string;
  orderDate?: string;
  subtotal: number;
  tax: number;
  shippingFee: number;
  total: number;
  items: Product[];
  estimatedDelivery?: string;
};

const OrderFulfillmentTemplate = ({
  customerName,
  orderNumber,
  subtotal,
  tax,
  shippingFee,
  total,
  items,
}: OrderFulfillmentEmailProps) => {
  customerName = customerName || "John Doe";
  orderNumber = orderNumber || "ORD-00000";
  subtotal = subtotal || 44.96;
  tax = tax || 2.45;
  shippingFee = shippingFee || 10.0;
  total = total || 57.21;
  items = items || demoItems;
  const previewText = `Your Order with number ${orderNumber} has been fulfilled`;

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
                  Thank you for your order, {customerName}! Your order has been
                  shipped and fulfilled.We will love to hear from you about your
                  purchase.
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
                    <Column className="p-3 w-1/2">{item.product.name}</Column>
                    <Column className="p-3 w-1/4 text-center">
                      {item.quantity}
                    </Column>
                    <Column className="p-3 w-1/4 text-right">
                      ${item.product.price.toFixed(2)}
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
                      ${subtotal.toFixed(2)}
                    </Column>
                  </Row>
                  <Row className="text-right">
                    <Column className="w-1/2"></Column>
                    <Column className="w-1/4 p-2 font-semibold">Tax(5%)</Column>
                    <Column className="w-1/4 p-2">${tax.toFixed(2)}</Column>
                  </Row>
                  <Row className="text-right">
                    <Column className="w-1/2"></Column>
                    <Column className="w-1/4 p-2 font-semibold">
                      Shipping
                    </Column>
                    <Column className="w-1/4 p-2">
                      ${shippingFee.toFixed(2)}
                    </Column>
                  </Row>
                  <Hr className="border-gray-300 my-2" />
                  <Row className="text-right font-bold">
                    <Column className="w-1/2"></Column>
                    <Column className="w-1/4 p-2">Total</Column>
                    <Column className="w-1/4 p-2">${total.toFixed(2)}</Column>
                  </Row>
                </Section>
              </Section>

              <Hr className="border-gray-300 my-6" />
              <Section className="text-center">
                <Link
                  href="/"
                  className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-md font-bold text-base no-underline inline-block transition-colors duration-300"
                >
                  Leave a Review
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

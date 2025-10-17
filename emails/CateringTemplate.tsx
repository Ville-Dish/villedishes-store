import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";
import { EmailHeader } from "./email-header";
import { EmailFooter } from "./email-footer";

type CateringEmailProps = {
  name: string;
  email: string;
  cateringDate: Date;
  phone: string;
  note?: string;
  products: string[];
};

const fakeProduct = [
  "Small Egusi (2.2L)",
  "Tray of Peppered Gizzard",
  "Tray of Agoyin Beans with Stew",
  "Small Tray of Smoky Nigerian Jollof",
  "Large Tray of Chicken (Hard Chicken)",
];

const CateringTemplate = ({
  name,
  email,
  cateringDate,
  phone,
  note,
  products,
}: CateringEmailProps) => {
  const previewText = "You have catering order inquiry from your website";
  const contactName = name ? name : "Jane Doe";
  const serviceDate = cateringDate
    ? cateringDate.toDateString()
    : "November 13th 2025";
  const menuList = products ? products : fakeProduct;
  const message = note ? note : `Notes from ${contactName}`;
  const contactPhone = phone ? phone : "123-456-7890";
  const contactEmail = email
    ? email
    : `${contactName.toLowerCase().replace(/\s+/g, ".")}@example.com`;
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body style={main}>
          <Container style={container}>
            <Section style={coverSection}>
              <EmailHeader />
              <Section style={verificationSection}>
                <Text className="text-[16px] mx-4 my-0">Dear VilleDishes,</Text>
                <Text className="text-[16px] mx-4 my-2">
                  My name is {contactName}. I would like to book a catering
                  service for {serviceDate}. The list of what I need is below as
                  well my contact details. I look forward to hearing from you.
                </Text>
                <Hr />
                <Heading as="h3" className="text-center">
                  Menu List
                </Heading>
                {menuList.map((menu, index) => (
                  <Section key={index} className="mb-[36px]">
                    <div className="mr-[32px] ml-[12px] inline-flex items-start">
                      <div className="mr-[18px] flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full bg-[#f5ad07] font-semibold text-white text-[12px] leading-none"></div>
                      <div>
                        <Heading
                          as="h5"
                          className="mt-[0px] mb-[4px] text-gray-900 text-[12px] leading-[28px]"
                        >
                          {menu}
                        </Heading>
                      </div>
                    </div>
                  </Section>
                ))}
                <Hr />

                {message && (
                  <>
                    <Text className="text-[16px] mx-4 my-0 text-center">
                      More details
                    </Text>
                    <Text style={codeText}>
                      {message || `Note from ${contactName}`}
                    </Text>
                  </>
                )}
                <Text className="text-[16px] mx-4 my-0">
                  You can reach me on {contactPhone} and {contactEmail}.
                </Text>
              </Section>
              <EmailFooter variant="contact" />
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default CateringTemplate;

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  width: "100%",
  maxWidth: "600px",
};

const coverSection = {
  padding: "24px",
  backgroundColor: "#ffffff",
};

const h1 = {
  color: "#333333",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
  padding: "0",
};

const verificationSection = {
  margin: "0 auto",
  width: "100%",
};

const verifyText = {
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "center" as const,
  margin: "16px 0",
  color: "#333333",
};

const codeText = {
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
  padding: "12px",
  backgroundColor: "#f4f4f4",
  borderRadius: "4px",
  textAlign: "center" as const,
  wordBreak: "break-word" as const,
};

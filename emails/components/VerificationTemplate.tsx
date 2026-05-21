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
  Button,
} from "@react-email/components";
import { EmailFooter } from "./email-footer";
import { EmailHeader } from "./email-header";

type VerificationEmailProps = {
  customerName: string;
  verificationLink: string;
};

const VerificationTemplate = ({
  customerName,
  verificationLink,
}: VerificationEmailProps) => {
  customerName = customerName || "John Doe";
  const previewText = `Verification Link for ${customerName}`;

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
                  Verify your Email
                </Heading>
                <Text className="text-lg mb-4">
                  Thank you for signing up with Villedishes. We want to ensure
                  it is really you and secure your account, please click the
                  button below to verify your email.
                </Text>

                <Button
                  className="bg-[#656ee8] rounded-[5px] text-white text-base font-bold no-underline text-center block p-2.5 font-serif"
                  href={verificationLink}
                >
                  Verify Email
                </Button>
                <Text className="text-[#333] font-serif text-base my-6">
                  or you can copy the vlink below
                </Text>
                <Text className="text-[#333] font-serif text-xs text-center justify-self-center mt-6 ml-6">
                  {verificationLink}
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

export default VerificationTemplate;

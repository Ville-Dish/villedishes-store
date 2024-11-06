import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { EmailHeader } from "./email-header";
import { EmailFooter } from "./email-footer";

type ContactEmailProps = {
  email: string;
  subject?: string;
  name: string;
  message: string;
};

const ContactTemplate = ({
  name,
  email,
  message,
  subject,
}: ContactEmailProps) => {
  const previewText = subject ? `${subject}` : "General Inquiry";
  return (
    <Html>
      <Head>
        <title>Contact Inquiry - Villedishes</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={coverSection}>
            <EmailHeader />
            <Section style={verificationSection}>
              <Heading style={h1}>
                You have received an inquiry via the Villedishes website
              </Heading>
              <Text style={verifyText}>Dear VilleDishes,</Text>
              <Text style={verifyText}>Here is the message from {name}</Text>
              <Text style={codeText}>
                {message || "Demo message from Marissa Storm"}
              </Text>
            </Section>
            <EmailFooter />
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ContactTemplate;

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

const imageSection = {
  textAlign: "center" as const,
  padding: "20px 0",
};

const logoStyle = {
  maxWidth: "100%",
  height: "auto",
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
  wordBreak: "break-word" as const,
};

const mainText = {
  fontSize: "14px",
  lineHeight: "24px",
  margin: "16px 0",
  color: "#333333",
};

const hrStyle = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

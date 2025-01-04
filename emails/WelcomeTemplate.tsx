// import { Html } from "@react-email/html";
// import { Text } from "@react-email/text";
// import { Section } from "@react-email/section";
// import { Container } from "@react-email/container";
import { Container, Html, Section, Text } from "@react-email/components";
import { EmailHeader } from "./email-header";
import { EmailFooter } from "./email-footer";

export default function WelcomeEmail() {
  return (
    <Html>
      <Section className="bg-white">
        <Container className="mx-auto my-0 pt-5 pb-12 w-[580px]">
          <EmailHeader />
          <Text className="text-2xl leading-tight font-bold text-[#484848]">
            Hi there!
          </Text>
          <Text className="text-lg leading-relaxed text-[#484848]">
            Welcome to our app!
          </Text>
          <EmailFooter />
        </Container>
      </Section>
    </Html>
  );
}

// Styles for the email template
const heading = {
  fontSize: "32px",
  lineHeight: "1.3",
  fontWeight: "700",
  color: "#484848",
};

const paragraph = {
  fontSize: "18px",
  lineHeight: "1.4",
  color: "#484848",
};

const main = {
  backgroundColor: "#ffffff",
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  width: "580px",
};

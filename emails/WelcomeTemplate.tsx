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
          <EmailFooter variant="contact" />
        </Container>
      </Section>
    </Html>
  );
}

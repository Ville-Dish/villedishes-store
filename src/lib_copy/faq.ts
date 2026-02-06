export interface FaqItems {
  id: number;
  question?: string;
  answer?: string | Array<string>;
}

export const faqItems = [
  {
    id: 1,
    question: "How to I make large orders for party?",
    answer:
      "Reach out to via the number, email address provided in the contact page or you can message us on our socials and through the contact form",
  },
  {
    id: 2,
    question: "How will I know my order has been accepted?",
    answer:
      "Once your payment has been verified, you will receive an email informing you about your order progress and pick up or delivery date",
  },
  {
    id: 3,
    question: "Can I pay during pick up or delivery?",
    answer:
      "A full payment or at least a 50% deposit has to be made before your order can be processed",
  },
  {
    id: 4,
    question: "How long does order processing takes?",
    answer:
      "The processing times varies depending on the food. You will get the estimate for your order in your order confirmation email.",
  },
];

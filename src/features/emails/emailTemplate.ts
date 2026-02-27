import React from "react";
import { z } from "zod";
import { sendEmailSchema, EmailType } from "./emailSchema";
import ContactTemplate from "../../../emails/components/ContactTemplate";
import CateringTemplate from "../../../emails/components/CateringTemplate";
import VerificationTemplate from "../../../emails/components/VerificationTemplate";
import VerifyPaymentTemplate from "../../../emails/components/VerifyPaymentTemplate";
import InvoiceTemplate from "../../../emails/components/InvoiceTemplate";
import OrderConfirmationTemplate from "../../../emails/components/OrderConfirmationTemplate";
import OrderFulfillmentTemplate from "../../../emails/components/OrderFulfillmentTemplate";
import OrderCancellationRequestTemplate from "../../../emails/components/OrderCancellationRequestTemplate";
import OrderCancellationTemplate from "../../../emails/components/OrderCancellationTemplate";

// Extract individual email types from the discriminated union
type ExtractEmailData<T extends EmailType> = Extract<
  z.infer<typeof sendEmailSchema>,
  { type: T }
>;

// Define props for each template
type ContactProps = {
  subject?: string;
  name: string;
  message: string;
  email: string;
  phone: string;
};

type CateringProps = {
  name: string;
  email: string;
  cateringDate: Date;
  phone: string;
  message?: string;
  products: string[];
};

type VerificationProps = {
  customerName: string;
  verificationLink: string;
};

type VerifyPaymentProps = {
  customerName: string;
  paymentAmount: number;
  paymentDate: string;
  paymentMethod?: string;
  referenceNumber: string;
  verificationCode: string;
  orderId: number;
  verificationLink?: string;
};

type InvoiceProps = {
  customerName: string;
  invoiceNumber: string;
};

type OrderConfirmationProps = {
  customerName: string;
  orderNumber: string;
  orderDate: string;
  subtotal: number;
  tax: number;
  shippingFee: number;
  total: number;
  items: any[];
  estimatedDelivery?: string;
};

type OrderFulfillmentProps = {
  customerName: string;
  orderNumber: string;
  subtotal: number;
  tax: number;
  shippingFee: number;
  total: number;
  items: any[];
  feedbackLink?: string;
};

type OrderCancellationRequestProps = {
  customerName: string;
  customerInteracEmail: string;
  orderNumber: string;
  orderDate: string;
  total: number;
};

type OrderCancellationProps = {
  customerName: string;
  orderNumber: string;
  total: number;
  feedbackLink?: string;
};

// Template configuration type with specific prop types
type TemplateConfig<T extends EmailType, P> = {
  component: React.ComponentType<P>;
  subject: string;
  transform: (data: ExtractEmailData<T>) => P;
};

// Create the typed template configuration map
export const emailTemplateConfig = {
  contact: {
    component: ContactTemplate,
    subject: "New Contact Message",
    transform: (data: ExtractEmailData<"contact">): ContactProps => ({
      subject: data.subject,
      name: data.name,
      message: data.message,
      email: data.email,
      phone: data.phone,
    }),
  } satisfies TemplateConfig<"contact", ContactProps>,

  catering: {
    component: CateringTemplate,
    subject: "New Catering Request",
    transform: (data: ExtractEmailData<"catering">): CateringProps => ({
      name: data.name,
      email: data.email,
      cateringDate: new Date(data.cateringDate),
      phone: data.phone,
      message: data.message,
      products: data.products,
    }),
  } satisfies TemplateConfig<"catering", CateringProps>,

  email_verification: {
    component: VerificationTemplate,
    subject: "Verify Your Email Address",
    transform: (
      data: ExtractEmailData<"email_verification">,
    ): VerificationProps => ({
      customerName: data.customerName,
      verificationLink: data.verificationLink,
    }),
  } satisfies TemplateConfig<"email_verification", VerificationProps>,

  verify_payment: {
    component: VerifyPaymentTemplate,
    subject: "Verify Your Payment",
    transform: (
      data: ExtractEmailData<"verify_payment">,
    ): VerifyPaymentProps => ({
      customerName: data.customerName,
      paymentAmount: data.paymentAmount,
      paymentDate: data.paymentDate,
      paymentMethod: data.paymentMethod,
      referenceNumber: data.referenceNumber,
      verificationCode: data.verificationCode,
      orderId: data.orderId,
      verificationLink: data.verificationLink,
    }),
  } satisfies TemplateConfig<"verify_payment", VerifyPaymentProps>,

  invoice: {
    component: InvoiceTemplate,
    subject: "Your Invoice",
    transform: (data: ExtractEmailData<"invoice">): InvoiceProps => ({
      customerName: data.customerName,
      invoiceNumber: data.invoiceNumber,
    }),
  } satisfies TemplateConfig<"invoice", InvoiceProps>,

  order_confirmation: {
    component: OrderConfirmationTemplate,
    subject: "Order Confirmation",
    transform: (
      data: ExtractEmailData<"order_confirmation">,
    ): OrderConfirmationProps => ({
      customerName: data.customerName,
      orderNumber: data.orderNumber,
      orderDate: data.orderDate,
      subtotal: data.subtotal,
      tax: data.tax,
      shippingFee: data.shippingFee,
      total: data.total,
      items: data.items,
      estimatedDelivery: data.estimatedDelivery,
    }),
  } satisfies TemplateConfig<"order_confirmation", OrderConfirmationProps>,

  order_fulfillment: {
    component: OrderFulfillmentTemplate,
    subject: "Your Order is on the Way",
    transform: (
      data: ExtractEmailData<"order_fulfillment">,
    ): OrderFulfillmentProps => ({
      customerName: data.customerName,
      orderNumber: data.orderNumber,
      subtotal: data.subtotal,
      tax: data.tax,
      shippingFee: data.shippingFee,
      total: data.total,
      items: data.items,
      feedbackLink: data.feedbackLink,
    }),
  } satisfies TemplateConfig<"order_fulfillment", OrderFulfillmentProps>,

  order_cancellation_request: {
    component: OrderCancellationRequestTemplate,
    subject: "Order Cancellation Request Received",
    transform: (
      data: ExtractEmailData<"order_cancellation_request">,
    ): OrderCancellationRequestProps => ({
      customerName: data.customerName,
      customerInteracEmail: data.customerInteracEmail,
      orderNumber: data.orderNumber,
      orderDate: data.orderDate,
      total: data.total,
    }),
  } satisfies TemplateConfig<
    "order_cancellation_request",
    OrderCancellationRequestProps
  >,

  order_cancellation_confirmation: {
    component: OrderCancellationTemplate,
    subject: "Order Cancelled Successfully",
    transform: (
      data: ExtractEmailData<"order_cancellation_confirmation">,
    ): OrderCancellationProps => ({
      customerName: data.customerName,
      orderNumber: data.orderNumber,
      total: data.total,
      feedbackLink: data.feedbackLink,
    }),
  } satisfies TemplateConfig<
    "order_cancellation_confirmation",
    OrderCancellationProps
  >,
} as const;

// Helper function that maintains type safety
function createTemplateElement<T extends EmailType>(
  type: T,
  data: ExtractEmailData<T>,
): React.ReactElement {
  const config = emailTemplateConfig[type] as TemplateConfig<T, any>;
  const props = config.transform(data);
  return React.createElement(config.component, props);
}

// Type-safe helper to build template
export function buildEmailTemplate(
  data: z.infer<typeof sendEmailSchema>,
): React.ReactElement {
  return createTemplateElement(data.type, data as any);
}

// Type-safe helper to get subject
export function getEmailSubject(type: EmailType): string {
  return emailTemplateConfig[type].subject;
}

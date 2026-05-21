"use server";

import {
  sendEmailSchema,
  SendEmailSchema,
} from "@/features/emails/emailSchema";
import nodemailer, { SendMailOptions } from "nodemailer";
import { render, toPlainText } from "@react-email/render";
import { templates } from "../template";
import { buildEmailTemplate, getEmailSubject } from "../emailTemplate";
import { Invoice } from "@/lib/types";
import {
  ColumnMappings,
  createInvoicePDF,
  DEFAULT_COLUMN_MAPPINGS,
  InvoiceDisplayMode,
} from "@/lib/invoicePdfGenerate";

interface InvoiceInfo {
  invoiceData: Invoice;
  displayMode: InvoiceDisplayMode;
  categoryMappings: Record<string, string>;
  columnMappings: ColumnMappings;
}

const mailTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  if (!host || !user || !pass || !process.env.SMTP_FROM_EMAIL) {
    throw new Error("SMTP env vars missing (HOST, USER, PASSWORD, FROM_EMAIL)");
  }
  const secure =
    process.env.SMTP_SECURE?.toLowerCase() === "true" || port === 465;
  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    ...(port === 465 && { requireTLS: true }),
    pool: true,
    maxConnections: 5,
    connectionTimeout: 10000,
  });
};

export const sendEmailAction = async (
  values: SendEmailSchema,
  invoiceInfo?: InvoiceInfo,
) => {
  const validatedValues = sendEmailSchema.safeParse(values);

  if (!validatedValues.success) {
    return {
      error: "Validation error",
      success: false,
    };
  }

  const data = validatedValues.data;
  const { to, type } = data;

  try {
    // Create transporter
    const transporter = mailTransporter();

    // Build the correct template element based on the discriminated `type`
    const templateElement = buildEmailTemplate(data);

    // Render template
    const emailHtml = await render(templateElement);
    const emailText = toPlainText(emailHtml);

    // Get Subject from template config if not provided
    const emailSubject = getEmailSubject(type as keyof typeof templates);
    const defaultFrom = `"${process.env.SMTP_FROM_NAME || "VilleDishes"}" <${process.env.SMTP_FROM_EMAIL}>`;

    const emailData: SendMailOptions = {
      from: defaultFrom,
      to,
      subject: emailSubject,
      html: emailHtml,
      text: emailText,
    };

    if (invoiceInfo) {
      const {
        invoiceData,
        displayMode = "detailed",
        categoryMappings = {},
        columnMappings = DEFAULT_COLUMN_MAPPINGS,
      } = invoiceInfo;

      const attachment = await createInvoicePDF(
        invoiceData,
        displayMode,
        categoryMappings,
        columnMappings,
      );

      // Check attachment size
      const attachmentSizeInMB = attachment.length / (1024 * 1024);
      const maxSizeInMB = 25;

      if (attachmentSizeInMB > maxSizeInMB) {
        throw new Error(
          `Attachment size (${attachmentSizeInMB.toFixed(2)}MB) exceeeds the maximum allowed size of $${maxSizeInMB}MB`,
        );
      }

      emailData.attachments = [
        {
          filename: `Invoice-${invoiceData.invoiceNumber}.pdf`,
          content: Buffer.from(attachment),
          contentType: "application/pdf",
        },
      ];
    }

    // Send Email
    await transporter.sendMail({
      ...emailData,
    });

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
};

export const sendMail = async (values: SendEmailSchema) => {
  // Validate before queuing
  const validatedValues = sendEmailSchema.safeParse(values);

  if (!validatedValues.success) {
    return {
      success: false,
      error: "Validation error",
    };
  }

  // If needed, this is where you would queue the email.
  // For now, we directly send it using the main action.
  return sendEmailAction(validatedValues.data);
};

// // Helper function to get default subject based on email type
// function getDefaultSubject(type: keyof typeof templates): string {
//   const subjects: Record<keyof typeof templates, string> = {
//     contact: "New Contact Message",
//     catering: "New Catering Request",
//     email_verification: "Verify Your Email Address",
//     verify_payment: "Verify Your Payment",
//     invoice: "Your Invoice",
//     order_confirmation: "Order Confirmation",
//     order_fulfillment: "Your Order is on the Way",
//     order_cancellation_request: "Order Cancellation Request Received",
//     order_cancellation_confirmation: "Order Cancelled Successfully",
//   };

//   return subjects[type] || "Notification";
// }

// // Helper that maps each email `type` to the correct template + props
// // Using `any` here keeps this file simple and avoids tight coupling to Zod's types.
// function buildTemplateForType(values: SendEmailSchema): React.ReactElement {
//   switch (values.type) {
//     case "contact": {
//       const ContactTemplate = templates.contact;
//       return React.createElement(ContactTemplate, {
//         subject: values.subject,
//         name: values.name,
//         message: values.message,
//         email: values.email,
//         phone: values.phone,
//       });
//     }
//     case "catering": {
//       const CateringTemplate = templates.catering;
//       return React.createElement(CateringTemplate, {
//         name: values.name,
//         email: values.email,
//         // Schema provides a string; template expects a Date
//         cateringDate: new Date(values.cateringDate),
//         phone: values.phone,
//         note: values.note,
//         products: values.products,
//       });
//     }
//     case "email_verification": {
//       const VerificationTemplate = templates.email_verification;
//       return React.createElement(VerificationTemplate, {
//         customerName: values.customerName,
//         verificationLink: values.verificationLink,
//       });
//     }
//     case "verify_payment": {
//       const VerifyPaymentTemplate = templates.verify_payment;
//       return React.createElement(VerifyPaymentTemplate, {
//         customerName: values.customerName,
//         paymentAmount: values.paymentAmount,
//         paymentDate: values.paymentDate,
//         paymentMethod: values.paymentMethod,
//         referenceNumber: values.referenceNumber,
//         verificationCode: values.verificationCode,
//         orderId: values.orderId,
//         verificationLink: values.verificationLink,
//       });
//     }
//     case "invoice": {
//       const InvoiceTemplate = templates.invoice;
//       return React.createElement(InvoiceTemplate, {
//         customerName: values.customerName,
//         invoiceNumber: values.invoiceNumber,
//       });
//     }
//     case "order_confirmation": {
//       const OrderConfirmationTemplate = templates.order_confirmation;
//       return React.createElement(OrderConfirmationTemplate, {
//         customerName: values.customerName,
//         orderNumber: values.orderNumber,
//         orderDate: values.orderDate,
//         subtotal: values.subtotal,
//         tax: values.tax,
//         shippingFee: values.shippingFee,
//         total: values.total,
//         items: values.items as any,
//         estimatedDelivery: values.estimatedDelivery,
//       });
//     }
//     case "order_fulfillment": {
//       const OrderFulfillmentTemplate = templates.order_fulfillment;
//       return React.createElement(OrderFulfillmentTemplate, {
//         customerName: values.customerName,
//         orderNumber: values.orderNumber,
//         subtotal: values.subtotal,
//         tax: values.tax,
//         shippingFee: values.shippingFee,
//         total: values.total,
//         items: values.items as any,
//         feedbackLink: values.feedbackLink,
//       });
//     }
//     case "order_cancellation_request": {
//       const OrderCancellationRequestTemplate =
//         templates.order_cancellation_request;
//       return React.createElement(OrderCancellationRequestTemplate, {
//         customerName: values.customerName,
//         customerInteracEmail: values.customerInteracEmail,
//         orderNumber: values.orderNumber,
//         orderDate: values.orderDate,
//         total: values.total,
//       });
//     }
//     case "order_cancellation_confirmation": {
//       const OrderCancellationTemplate =
//         templates.order_cancellation_confirmation;

//       return React.createElement(OrderCancellationTemplate, {
//         customerName: values.customerName,
//         orderNumber: values.orderNumber,
//         total: values.total,
//         feedbackLink: values.feedbackLink,
//       });
//     }
//   }

//   // throw new Error(`Unsupported email type: ${values?.type}`);
// }

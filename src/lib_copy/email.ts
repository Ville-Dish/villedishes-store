import nodemailer from "nodemailer";
import { createInvoicePDF } from "./invoicePdfGenerate";

type EmailPayload = {
  from: string;
  to: string;
  subject: string;
  html: string;
  replyTo: string;
};

interface ScheduledEmailOptions extends EmailPayload {
  scheduledDate: Date;
}

// Replace with your SMTP credentials
const smtpOptions = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: true,
  auth: {
    user: process.env.SMTP_USER || "villedishes@gmail.com",
    pass: process.env.SMTP_PASSWORD || "password",
  },
};

export const sendEmail = async (data: EmailPayload) => {
  const transporter = nodemailer.createTransport({
    ...smtpOptions,
  });

  return await transporter.sendMail({
    ...data,
  });
};

export const sendInvoiceEmail = async (
  invoiceData: Invoice,
  emailData: EmailPayload
) => {
  const transporter = nodemailer.createTransport({
    ...smtpOptions,
  });

  const pdfData = await createInvoicePDF(invoiceData);

  // Check PDF size
  const pdfSizeInMB = pdfData.length / (1024 * 1024);
  const maxSizeInMB = 25; // Gmail's attachment size limit is 25MB

  if (pdfSizeInMB > maxSizeInMB) {
    throw new Error(
      `PDF size (${pdfSizeInMB.toFixed(
        2
      )}MB) exceeds the maximum allowed size of ${maxSizeInMB}MB`
    );
  }

  return await transporter.sendMail({
    ...emailData,
    attachments: [
      {
        filename: `Invoice-${invoiceData.invoiceNumber}.pdf`,
        content: Buffer.from(pdfData), // Convert Uint8Array to Buffer
        contentType: "application/pdf",
      },
    ],
  });
};

export const scheduleEmail = async (options: ScheduledEmailOptions) => {
  const { scheduledDate, ...email } = options;
  const delay = scheduledDate.getTime() - Date.now();

  setTimeout(() => {
    sendEmail(email).catch(console.error);
  }, delay);

  console.log(`Email scheduled for ${scheduledDate}`);
};

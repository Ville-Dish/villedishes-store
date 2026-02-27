import { NextResponse } from "next/server";
import { render } from "@react-email/components";
// import { sendInvoiceEmail } from "../../../../../emails/schema/email";
// import InvoiceTemplate from "@/emails/InvoiceTemplate";
import {
  DEFAULT_COLUMN_MAPPINGS,
  InvoiceDisplayMode,
} from "@/lib/invoicePdfGenerate";
import InvoiceTemplate from "../../../../../emails/components/InvoiceTemplate";
import { sendEmailAction } from "@/features/emails/actions/sendMail";
import { EmailType } from "@/features/emails/emailSchema";

export async function POST(req: Request) {
  try {
    const {
      from,
      to,
      subject,
      customerName,
      invoiceNumber,
      invoice,
      displayMode = "detailed",
      categoryMappings = {},
      columnMappings = DEFAULT_COLUMN_MAPPINGS,
    } = await req.json();

    if (!from || !to || !subject) {
      return NextResponse.json(
        { message: "Missing email parameters" },
        { status: 400 },
      );
    }

    const emailHtml = await render(
      InvoiceTemplate({
        customerName,
        invoiceNumber,
      }),
    );

    const options = {
      to: to as string,
      type: "invoice",
      customerName: customerName as string,
      invoiceNumber: invoiceNumber as string,
    } as const;

    await sendEmailAction(options, {
      invoiceData: invoice,
      displayMode: displayMode as InvoiceDisplayMode,
      categoryMappings,
      columnMappings,
    });

    return NextResponse.json(
      { message: "Email with attached pdf sent successfully" },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Error sending email:", error);

    if (error instanceof Error) {
      if (error.message.includes("PDF size")) {
        return NextResponse.json(
          { message: "Error sending email", error: error.message },
          { status: 413 }, // 413 Payload Too Large
        );
      }
      return NextResponse.json(
        { message: "Error sending email", error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: "Error sending email", error: "An unknown error occurred" },
      { status: 500 },
    );
  }
}

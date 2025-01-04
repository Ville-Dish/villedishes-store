import { NextResponse } from "next/server";
import { render } from "@react-email/components";
import { sendInvoiceEmail } from "@/lib/email";
import InvoiceTemplate from "@/emails/InvoiceTemplate";

export async function POST(req: Request) {
  try {
    const { from, to, subject, customerName, invoiceNumber, invoice } =
      await req.json();

    if (!from || !to || !subject) {
      return NextResponse.json(
        { message: "Missing email parameters" },
        { status: 400 }
      );
    }

    const emailHtml = await render(
      InvoiceTemplate({
        customerName,
        invoiceNumber,
      })
    );

    const options = {
      from,
      to,
      subject,
      html: emailHtml,
      replyTo: from,
    };

    await sendInvoiceEmail(invoice, options);

    return NextResponse.json(
      { message: "Email with attached pdf sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error sending email", error },
      { status: 500 }
    );
  }
}

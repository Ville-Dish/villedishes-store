import { NextResponse } from "next/server";
import VerifyPaymentTemplate from "@/emails/VerifyPayment";
import { render } from "@react-email/components";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const {
      from,
      to,
      subject,
      customerName,
      paymentAmount,
      paymentDate,
      referenceNumber,
      orderId,
      verificationCode,
    } = await req.json();

    // console.log("Received email parameters:", { from, to, subject });

    if (!from || !to || !subject) {
      // console.error("Missing email parameters", { from, to, subject });
      return NextResponse.json(
        { message: "Missing email parameters" },
        { status: 400 }
      );
    }

    const emailHtml = await render(
      VerifyPaymentTemplate({
        customerName,
        paymentAmount,
        paymentDate,
        referenceNumber,
        orderId,
        verificationCode,
      })
    );

    const options = {
      from,
      to,
      subject,
      html: emailHtml,
      replyTo: from,
    };

    await sendEmail(options);
    return NextResponse.json(
      { message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error sending email", error },
      { status: 500 }
    );
  }
}

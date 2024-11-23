import { NextResponse } from "next/server";
import OrderConfirmationTemplate from "@/emails/OrderConfirmationTemplate";
import { render } from "@react-email/components";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const {
      from,
      to,
      subject,
      customerName,
      orderNumber,
      orderDate,
      subtotal,
      tax,
      shippingFee,
      total,
      items,
      estimatedDelivery,
    } = await req.json();

    if (!from || !to || !subject) {
      return NextResponse.json(
        { message: "Missing email parameters" },
        { status: 400 }
      );
    }

    const emailHtml = await render(
      OrderConfirmationTemplate({
        customerName,
        orderNumber,
        orderDate,
        subtotal: Number(subtotal),
        tax: Number(tax),
        shippingFee: Number(shippingFee),
        total: Number(total),
        items,
        estimatedDelivery,
      })
    );

    const options = {
      from,
      to,
      subject,
      html: emailHtml,
      replyTo: from,
    };

    try {
      await sendEmail(options);
    } catch (emailError) {
      console.error("Error in sendEmail:", emailError);
      return NextResponse.json(
        { message: "Error sending email", error: emailError },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in POST handler:", error);
    return NextResponse.json(
      { message: "Error processing request", error },
      { status: 500 }
    );
  }
}

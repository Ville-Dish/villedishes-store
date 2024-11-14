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
        subtotal,
        tax,
        shippingFee,
        total,
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

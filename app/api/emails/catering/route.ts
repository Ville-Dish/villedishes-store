import { NextResponse } from "next/server";
import CateringTemplate from "@/emails/CateringTemplate";
import { render } from "@react-email/components";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { from, to, name, phone, email, notes, products, date } =
      await req.json();

    // console.log({ from, to, name, phone, email, notes, products, date });
    if (!from || !to || !products || !Array.isArray(products)) {
      return NextResponse.json(
        { message: "Missing email parameters" },
        { status: 400 }
      );
    }

    const emailHtml = await render(
      CateringTemplate({
        name,
        phone,
        email,
        note: notes,
        cateringDate: new Date(date),
        products,
      })
    );

    const options = {
      from,
      to,
      subject: "Catering Service Inquiry",
      html: emailHtml,
      replyTo: from,
    };

    await sendEmail(options);
    return NextResponse.json(
      { message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending mail:", error);
    return NextResponse.json(
      { message: "Error sending email", error },
      { status: 500 }
    );
  }
}

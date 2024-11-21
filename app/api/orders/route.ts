import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { isValidOrderStatus } from "@/lib/orderUtils";
import { generateOrderNumber } from "@/lib/orderHelperFunction";

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     if (!body || Object.keys(body).length === 0) {
//       return NextResponse.json(
//         { error: "Missing request body" },
//         { status: 400 }
//       );
//     }
//     console.log("BODY", body);

//     const {
//       id,
//       paymentDate,
//       products,
//       referenceNumber,
//       shippingFee,
//       shippingInfo,
//       status,
//       subtotal,
//       tax,
//       total,
//       orderDate,
//       orderNumber,
//       verificationCode,
//     } = body;

//     console.log("After body destructing");

//     // Validate required fields
//     if (!shippingInfo || !products || !products.length) {
//       return NextResponse.json(
//         { message: "Shipping information and products are required" },
//         { status: 400 }
//       );
//     }
//     console.log("After Validating shippingInfo and Products");

//     // Validate the status using the isValidInvoiceStatus function
//     if (!isValidOrderStatus(status)) {
//       return NextResponse.json(
//         { message: "Invalid order status" },
//         { status: 400 }
//       );
//     }
//     console.log("After Validating order status");

//     // Create order
//     const newOrder = await prisma.order.create({
//       data: {
//         orderId: id,
//         paymentDate,
//         referenceNumber,
//         shippingFee,
//         status,
//         subtotal,
//         tax,
//         total,
//         verificationCode,
//         orderDate,
//         orderNumber,
//         shippingInfo: {
//           create: shippingInfo,
//         },
//         products: {
//           create: products.map(
//             (p: { productId: string; quantity: number }) => ({
//               product: { connect: { id: p.productId } },
//               quantity: p.quantity,
//             })
//           ),
//         },
//       },
//       include: {
//         shippingInfo: true,
//         products: {
//           include: {
//             product: true,
//           },
//         },
//       },
//     });
//     console.log("After create order");
//     console.log("NEW ORDER", newOrder);
//     return NextResponse.json({
//       data: newOrder,
//       message: "Order Added Successfully",
//       status: 201,
//     });
//   } catch (error) {
//     console.log("", error);
//     return NextResponse.json(
//       { message: "Error adding order", error },
//       { status: 500 }
//     );
//   }
// }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: "Missing request body" },
        { status: 400 }
      );
    }

    const {
      id,
      paymentDate,
      products,
      referenceNumber,
      shippingFee,
      shippingInfo,
      status,
      subtotal,
      tax,
      total,
      orderDate,
      orderNumber,
      verificationCode,
    } = body;

    // Validate required fields
    if (!shippingInfo || !products || !products.length) {
      return NextResponse.json(
        { message: "Shipping information and products are required" },
        { status: 400 }
      );
    }

    // Validate the status using the isValidOrderStatus function
    if (status && !isValidOrderStatus(status)) {
      return NextResponse.json(
        { message: "Invalid order status" },
        { status: 400 }
      );
    }

    // Generate order number if not provided
    const finalOrderNumber = orderNumber || (await generateOrderNumber());

    // Check if shipping info exists and update or create
    let shipping;
    const existingShippingInfo = await prisma.shippingInfo.findFirst({
      where: {
        AND: [
          { email: shippingInfo.email },
          { phoneNumber: shippingInfo.phoneNumber },
        ],
      },
    });

    if (existingShippingInfo) {
      shipping = await prisma.shippingInfo.update({
        where: { id: existingShippingInfo.id },
        data: {
          ...shippingInfo,
        },
      });
    } else {
      shipping = await prisma.shippingInfo.create({
        data: {
          ...shippingInfo,
        },
      });
    }

    if (!shipping) {
      return NextResponse.json(
        {
          message: "Error adding order",
        },
        { status: 400 }
      );
    }

    // Create order
    const newOrder = await prisma.order.create({
      data: {
        orderId: id,
        paymentDate: paymentDate || null,
        referenceNumber,
        shippingFee,
        status: status || "UNVERIFIED",
        subtotal,
        tax,
        total,
        verificationCode,
        orderDate: orderDate || new Date().toISOString().split("T")[0],
        orderNumber: finalOrderNumber,
        shippingInfoId: shipping.id,
      },
    });

    if (!newOrder) {
      return NextResponse.json(
        {
          message: "Error adding order",
        },
        { status: 400 }
      );
    }

    for (const product of products) {
      await prisma.orderProduct.create({
        data: {
          orderId: newOrder.id,
          productId: product.productId,
          quantity: product.quantity,
        },
      });
    }

    return NextResponse.json({
      data: newOrder,
      message: "Order Added Successfully",
      status: 201,
    });
  } catch (error) {
    console.error("Error adding order:", error);
    return NextResponse.json(
      {
        message: "Error adding order",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        shippingInfo: true, // Assuming 'shippingInfo' is a relation in your Prisma schema
        products: {
          include: {
            product: true,
          },
        }, // Assuming 'products' is a relation in your Prisma schema
      },
    });
    return NextResponse.json({
      data: orders,
      message: "Order retrieved successfully",
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error sending email", error },
      { status: 500 }
    );
  }
}

// PATCH method to update an order
export async function PATCH(req: Request) {
  try {
    const { orderId, status, orderDate } = await req.json();

    const orderNumber = await generateOrderNumber();

    if (!orderId) {
      return NextResponse.json(
        { message: "Order ID is required" },
        { status: 400 }
      );
    }

    // Define the type for updateData using Partial and your Prisma model
    const updateData: Partial<{
      status: string;
      orderNumber: string;
      orderDate: string; // Adjust type if orderDate is a Date
    }> = {};

    if (status !== undefined) updateData.status = status;
    if (orderNumber !== undefined) updateData.orderNumber = orderNumber;
    if (orderDate !== undefined) updateData.orderDate = orderDate;

    // Check if there's any data to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: "No fields to update provided" },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { orderId },
      data: updateData,
      include: {
        shippingInfo: true,
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: updatedOrder,
      message: "Order updated successfully",
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating order", error },
      { status: 500 }
    );
  }
}

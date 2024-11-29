import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { isValidOrderStatus } from "@/lib/orderUtils";
import { generateOrderNumber } from "@/lib/orderHelperFunction";
import { verifyToken } from "@/lib/helper";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: "Missing request body" },
        { status: 400 }
      );
    }

    await verifyToken(req);

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
    const { orderId, providedVerificationCode } = await req.json();

    await verifyToken(req);

    if (!orderId) {
      return NextResponse.json(
        { message: "Order ID is required" },
        { status: 400 }
      );
    }

    // Fetch the order from the database
    const order = await prisma.order.findUnique({
      where: { orderId },
      include: {
        shippingInfo: true,
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Check if the provided verification code matches
    if (order.verificationCode !== providedVerificationCode) {
      return NextResponse.json(
        { message: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Generate new order number
    const newOrderNumber = await generateOrderNumber();

    // Update the order
    const updatedOrder = await prisma.order.update({
      where: { orderId },
      data: {
        status: "PENDING",
        orderNumber: newOrderNumber,
        orderDate: order.paymentDate, // Set orderDate to paymentDate
      },
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
      message: "Order verified and updated successfully",
      status: 200,
    });
  } catch (error) {
    console.error("Error verifying and updating order:", error);
    return NextResponse.json(
      { message: "Error verifying and updating order", error },
      { status: 500 }
    );
  }
}

// New PUT method to update only the order status
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    await verifyToken(req);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 }
      );
    }

    const { orderId, newStatus } = body;

    if (!orderId || !newStatus) {
      return NextResponse.json(
        { message: "Order ID and new status are required" },
        { status: 400 }
      );
    }

    // Validate the new status
    if (!isValidOrderStatus(newStatus)) {
      return NextResponse.json(
        { message: "Invalid order status" },
        { status: 400 }
      );
    }

    // Update the order status
    const updatedOrder = await prisma.order.update({
      where: { orderId },
      data: { status: newStatus },
      include: {
        shippingInfo: true,
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!updatedOrder) {
      return NextResponse.json(
        { message: "Order not found or could not be updated" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: updatedOrder,
      message: "Order status updated successfully",
      status: 200,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      {
        message: "Error updating order status",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

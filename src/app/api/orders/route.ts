import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { isValidOrderStatus } from "@/lib/utils";
import { generateOrderNumber } from "@/lib/helper";

const orderInclude = {
  shippingInfo: true,
  products: {
    include: { product: true },
  },
};

const badRequest = (message: string) =>
  NextResponse.json({ message }, { status: 400 });

const serverError = (message: string, error?: unknown) =>
  NextResponse.json(
    {
      message,
      error: error instanceof Error ? error.message : "Unknown error",
    },
    { status: 500 },
  );

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return badRequest("Invalid request body");
    }

    console.log({ body });

    const {
      id,
      paymentDate,
      products,
      referenceNumber,
      shippingFee = 0,
      shippingInfo,
      status = "UNVERIFIED",
      subtotal,
      tax,
      total,
      orderDate,
      orderNumber,
      verificationCode,
    } = body;

    // Validate required fields
    if (!shippingInfo?.email || !shippingInfo?.phoneNumber) {
      return badRequest("Valid shipping information is required");
    }

    // Validate the status using the isValidOrderStatus function
    if (!Array.isArray(products) || products.length === 0) {
      return badRequest("At least one product is required");
    }

    if (status && !isValidOrderStatus(status)) {
      return badRequest("Invalid order status");
    }

    // Generate order number if not provided
    // const finalOrderNumber = orderNumber ?? (await generateOrderNumber());
    const tempOrderNumber = orderNumber;

    const result = await prisma.$transaction(async (tx) => {
      // Upsert shipping info
      const shipping = await tx.shippingInfo.upsert({
        where: {
          email_phoneNumber: {
            email: shippingInfo.email,
            phoneNumber: shippingInfo.phoneNumber,
          },
        },
        update: {
          firstName: shippingInfo.firstName,
          lastName: shippingInfo.lastName,
          address: shippingInfo.address,
          city: shippingInfo.city,
          postalCode: shippingInfo.postalCode,
          orderNotes: shippingInfo.orderNotes,
        },
        create: {
          firstName: shippingInfo.firstName,
          lastName: shippingInfo.lastName,
          email: shippingInfo.email,
          phoneNumber: shippingInfo.phoneNumber,
          address: shippingInfo.address,
          city: shippingInfo.city,
          postalCode: shippingInfo.postalCode,
          orderNotes: shippingInfo.orderNotes,
        },
      });

      // Create order
      const newOrder = await tx.order.create({
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
          orderNumber: tempOrderNumber,
          shippingInfoId: shipping.id,
        },
      });

      // Bulk insert products
      await tx.orderProduct.createMany({
        data: products.map((product) => ({
          orderId: newOrder.id,
          productId: product.productId,
          quantity: product.quantity,
        })),
      });

      return newOrder;
    });

    const fullOrder = await prisma.order.findUnique({
      where: { id: result.id },
      include: orderInclude,
    });

    return NextResponse.json(
      { data: fullOrder, message: "Order added successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /order error:", error);
    return serverError("Error adding order", error);
  }
}

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: orderInclude,
      orderBy: { orderDate: "desc" },
    });

    return NextResponse.json(
      { data: orders, message: "Orders retrieved successfully" },
      { status: 200 },
    );
  } catch (error) {
    return serverError("Error retrieving orders", error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { orderId, providedVerificationCode } = await req.json();

    if (!orderId || !providedVerificationCode) {
      return badRequest("Order ID and verification code are required");
    }

    const order = await prisma.order.findUnique({
      where: { orderId },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    if (order.verificationCode !== providedVerificationCode) {
      return badRequest("Invalid verification code");
    }

    const newOrderNumber = await generateOrderNumber();

    const updatedOrder = await prisma.order.update({
      where: { orderId },
      data: {
        status: "PENDING",
        orderNumber: newOrderNumber,
        orderDate: order.paymentDate ?? new Date().toISOString(),
      },
      include: orderInclude,
    });

    return NextResponse.json(
      { data: updatedOrder, message: "Order verified successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("PATCH /order error:", error);
    return serverError("Error verifying order", error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { orderId, newStatus } = await req.json();

    if (!orderId || !newStatus) {
      return badRequest("Order ID and new status are required");
    }

    if (!isValidOrderStatus(newStatus)) {
      return badRequest("Invalid order status");
    }

    const updatedOrder = await prisma.order.update({
      where: { orderId },
      data: { status: newStatus },
      include: orderInclude,
    });

    return NextResponse.json(
      { data: updatedOrder, message: "Order status updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("PUT /order error:", error);
    return serverError("Error updating order status", error);
  }
}

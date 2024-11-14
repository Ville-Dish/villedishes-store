import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";

export async function POST(req: Request) {
  try {
    const {
      orderId,
      paymentDate,
      products,
      referenceNumber,
      shippingFee,
      shippingInfo,
      status,
      subtotal,
      tax,
      total,
      verificationCode,
    } = await req.json();

    // Validate required fields
    if (!shippingInfo || !products || !products.length) {
      return NextResponse.json(
        { message: "Shipping information and products are required" },
        { status: 400 }
      );
    }

    // Create order
    const newOrder = await prisma.order.create({
      data: {
        orderId,
        paymentDate,
        referenceNumber,
        shippingFee,
        status,
        subtotal,
        tax,
        total,
        verificationCode,
        shippingInfo: {
          create: shippingInfo,
        },
        products: {
          create: products.map(
            (p: { productId: string; quantity: number }) => ({
              product: { connect: { id: p.productId } },
              quantity: p.quantity,
            })
          ),
        },
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
      data: newOrder,
      message: "Order Added Successfully",
      status: 201,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error adding order", error },
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
    const { orderId, status, orderNumber, orderDate } = await req.json();

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

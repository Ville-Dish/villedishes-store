"use server";
import prisma from "./prisma/client";

// Function to generate the next invoice number
export async function generateOrderNumber() {
  try {
    // Query the database to find the maximum order number with ORD prefix
    const maxOrder = await prisma.order.findFirst({
      where: {
        orderNumber: {
          startsWith: "ORD-",
        },
      },
      orderBy: {
        orderNumber: "desc",
      },
      select: {
        orderNumber: true,
      },
    });

    let nextNumber = 1;
    if (maxOrder?.orderNumber) {
      const numericPart = parseInt(maxOrder.orderNumber.split("-")[1], 10);
      if (!isNaN(numericPart)) {
        nextNumber = numericPart + 1;
      }
    }

    // Format the order number with leading zeros (e.g., ORD-0001, ORD-0002)
    return `ORD-${String(nextNumber).padStart(4, "0")}`;
  } catch (error) {
    console.error("Error generating order number:", error);
    throw new Error("Failed to generate order number");
  }
}

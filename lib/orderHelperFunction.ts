"use server";
import prisma from "./prisma/client";

// Function to generate the next invoice number
export async function generateOrderNumber() {
  // Query the database to find the maximum numeric part of the existing invoice numbers
  const maxOrder = await prisma.order.findFirst({
    orderBy: {
      orderNumber: "desc", // Sort by invoiceNumber in descending order
    },
    select: {
      orderNumber: true, // Only retrieve the invoiceNumber field
    },
  });

  let nextNumber = 1; // Default if there are no existing invoices
  if (maxOrder?.orderNumber) {
    const numericPart = parseInt(maxOrder.orderNumber.replace("ORD", ""), 10);
    if (!isNaN(numericPart)) {
      nextNumber = numericPart + 1;
    }
  }

  // Format the invoice number with leading zeros (e.g., INV001, INV002)
  return `ORD${String(nextNumber).padStart(3, "0")}`;
}

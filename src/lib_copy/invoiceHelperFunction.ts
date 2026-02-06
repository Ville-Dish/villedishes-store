"use server";
import prisma from "./prisma/client";

// Function to generate the next invoice number
export async function generateInvoiceNumber() {
  try {
    // Query the database to find the maximum numeric part of the existing invoice numbers
    const maxInvoice = await prisma.invoice.findFirst({
      orderBy: {
        invoiceNumber: "desc", // Sort by invoiceNumber in descending order
      },
      select: {
        invoiceNumber: true, // Only retrieve the invoiceNumber field
      },
    });

    let nextNumber = 1; // Default if there are no existing invoices
    if (maxInvoice?.invoiceNumber) {
      const numericPart = parseInt(maxInvoice.invoiceNumber.split("-")[1], 10);
      if (!isNaN(numericPart)) {
        nextNumber = numericPart + 1;
      }
    }

    // Format the invoice number with leading zeros (e.g., INV-0001, INV-0002)
    return `INV-${String(nextNumber).padStart(4, "0")}`;
  } catch (error) {
    console.error("Error generating invoice number:", error);
    throw new Error("Failed to generate invoice number");
  }
}

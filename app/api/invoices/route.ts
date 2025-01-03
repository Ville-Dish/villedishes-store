import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { InvoiceStatus, isValidInvoiceStatus } from "@/lib/invoiceUtils";
import { generateInvoiceNumber } from "@/lib/invoiceHelperFunction";

// POST method to create a new invoice
export async function POST(req: Request) {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      dueDate,
      status = "PENDING",
      amount = 0,
      discountPercentage = 0,
    } = await req.json();

    const invoiceNumber = await generateInvoiceNumber();

    // Input validation
    if (
      !customerName ||
      typeof customerName !== "string" ||
      customerName.trim() === ""
    ) {
      return NextResponse.json(
        { message: "Invalid or missing customer name" },
        { status: 400 }
      );
    }

    if (
      !customerEmail ||
      typeof customerEmail !== "string" ||
      customerEmail.trim() === ""
    ) {
      return NextResponse.json(
        { message: "Invalid or missing customer email" },
        { status: 400 }
      );
    }

    if (
      !customerPhone ||
      typeof customerPhone !== "string" ||
      customerPhone.trim() === ""
    ) {
      return NextResponse.json(
        { message: "Invalid or missing customer phone" },
        { status: 400 }
      );
    }

    if (!dueDate || typeof dueDate !== "string") {
      return NextResponse.json(
        { message: "Invalid or missing due date" },
        { status: 400 }
      );
    }

    // Ensure the invoiceNumber is provided and valid
    if (!invoiceNumber || typeof invoiceNumber !== "string") {
      return NextResponse.json(
        { message: "Invalid or missing invoice number" },
        { status: 400 }
      );
    }

    // Validate the status using the isValidInvoiceStatus function
    if (!isValidInvoiceStatus(status)) {
      return NextResponse.json(
        { message: "Invalid invoice status" },
        { status: 400 }
      );
    }

    // Create a new invoice with the data provided from the frontend
    const newInvoice = await prisma.invoice.create({
      data: {
        customerName,
        customerEmail,
        customerPhone,
        amount,
        discountPercentage,
        dateCreated: new Date().toISOString().split("T")[0], // Default to current date if not provided
        dueDate,
        status,
        invoiceNumber, // Save the invoiceNumber
      },
    });

    return NextResponse.json({
      data: newInvoice,
      message: "Invoice Added Successfully",
      status: 201,
    });
  } catch (error) {
    console.log("Error Adding Invoice", error);
    return NextResponse.json(
      { message: "Error adding invoice", error },
      { status: 500 }
    );
  }
}

// PATCH method to update an invoice
export async function PATCH(req: Request) {
  try {
    const {
      id,
      customerName,
      customerEmail,
      customerPhone,
      dueDate,
      status,
      products,
      amount,
      amountPaid,
      amountDue,
      discountPercentage,
      taxRate,
      shippingFee,
    } = await req.json();

    if (!id) {
      return NextResponse.json(
        { message: "Invoice ID is required" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (customerName !== undefined) updateData.customerName = customerName;
    if (customerEmail !== undefined) updateData.customerEmail = customerEmail;
    if (customerPhone !== undefined) updateData.customerPhone = customerPhone;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (amount !== undefined) updateData.amount = amount;
    if (amountPaid !== undefined) updateData.amountPaid = amountPaid;
    if (amountDue !== undefined) updateData.amountDue = amountDue;
    if (taxRate !== undefined) updateData.taxRate = taxRate;
    if (shippingFee !== undefined) updateData.shippingFee = shippingFee;
    if (discountPercentage !== undefined)
      updateData.discountPercentage = discountPercentage;

    // Determine the status based on products and due date
    const currentDate = new Date();
    const invoiceDueDate = new Date(dueDate);

    if (products && products.length > 0) {
      updateData.status =
        currentDate > invoiceDueDate
          ? InvoiceStatus.OVERDUE
          : InvoiceStatus.UNPAID;
    } else {
      updateData.status = InvoiceStatus.PENDING;
    }

    // If status is provided and valid, use it (allows manual override)
    if (status && isValidInvoiceStatus(status)) {
      updateData.status = status;
    }

    // Start a transaction
    const updatedInvoice = await prisma.$transaction(async (prisma) => {
      // Update the invoice
      const invoice = await prisma.invoice.update({
        where: { id },
        data: updateData,
      });

      // If products are provided, update them
      if (products && products.length > 0) {
        // Delete existing InvoiceProducts
        await prisma.invoiceProducts.deleteMany({
          where: { invoiceId: id },
        });

        // Create new InvoiceProducts
        for (const product of products) {
          await prisma.invoiceProducts.create({
            data: {
              invoiceId: id,
              basePrice: product.basePrice,
              quantity: product.quantity,
              price: product.basePrice * product.quantity,
              discount: product.discount || 0,
              Product: {
                connect: { id: product.id },
              },
            },
          });
        }
      }

      return invoice;
    });

    if (!updatedInvoice) {
      return NextResponse.json(
        { message: "Invoice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: updatedInvoice,
      message: "Invoice updated successfully",
      status: 200,
    });
  } catch (error) {
    console.log("ERROR: ", error);
    return NextResponse.json(
      { message: "Error updating invoice", error },
      { status: 500 }
    );
  }
}

// GET method to retrieve all invoices
export async function GET() {
  try {
    const currentDate = new Date();

    // Retrieve all invoices
    const invoices = await prisma.invoice.findMany({
      include: {
        InvoiceProducts: {
          include: {
            Product: true,
          },
        },
      },
    });

    // Transform the data to match the expected format
    const transformedInvoices = await Promise.all(
      invoices.map(async (invoice) => {
        let status = invoice.status;
        const dueDate = new Date(invoice.dueDate);

        //Check if the invoice is overdue and not already marked as PAID
        if (currentDate > dueDate && invoice.status !== InvoiceStatus.PAID) {
          status = InvoiceStatus.OVERDUE;

          //Update the status in the database
          await prisma.invoice.update({
            where: { id: invoice.id },
            data: { status },
          });
        }

        return {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          customerName: invoice.customerName,
          customerEmail: invoice.customerEmail,
          customerPhone: invoice.customerPhone,
          amount: invoice.amount,
          amountPaid: invoice.amountPaid,
          amountDue: invoice.amountDue,
          dateCreated: invoice.dateCreated,
          dueDate: invoice.dueDate,
          status: invoice.status,
          discountPercentage: invoice.discountPercentage,
          products: invoice.InvoiceProducts.map((ip) => ({
            id: ip.Product[0]?.id,
            name: ip.Product[0]?.name,
            basePrice: ip.basePrice,
            quantity: ip.quantity,
            discount: ip.discount,
          })),
        };
      })
    );

    return NextResponse.json({
      data: transformedInvoices,
      message: "Invoices retrieved successfully",
      status: 200,
    });
  } catch (error) {
    console.error("Error retrieving invoices:", error);
    return NextResponse.json(
      { message: "Error retrieving invoices", error },
      { status: 500 }
    );
  }
}

// DELETE method to delete an invoice
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    const deletedInvoice = await prisma.invoice.delete({
      where: { id },
    });

    return NextResponse.json({
      data: deletedInvoice,
      message: "Invoice deleted successfully",
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting invoice", error },
      { status: 500 }
    );
  }
}

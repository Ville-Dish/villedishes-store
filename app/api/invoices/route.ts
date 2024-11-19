import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { isValidInvoiceStatus } from "@/lib/invoiceUtils";
import { generateInvoiceNumber } from "@/lib/invoiceHelperFunction";
import { shippingFee, taxRate } from "@/lib/constantData";

// POST method to create a new invoice
export async function POST(req: Request) {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      dueDate,
      status,
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
    return NextResponse.json(
      { message: "Error adding invoice", error },
      { status: 500 }
    );
  }
}

// GET method to retrieve all invoices
export async function GET() {
  try {
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
    const transformedInvoices = invoices.map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      customerName: invoice.customerName,
      customerEmail: invoice.customerEmail,
      customerPhone: invoice.customerPhone,
      amount: invoice.amount,
      dateCreated: invoice.dateCreated,
      dueDate: invoice.dueDate,
      status: invoice.status,
      discountPercentage: invoice.discountPercentage,
      products: invoice.InvoiceProducts.map((ip) => ({
        id: ip.Product[0]?.id,
        name: ip.Product[0]?.name,
        basePrice: ip.basePrice,
        quantity: ip.quantity,
      })),
    }));

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
      discountPercentage,
      taxRate,
      shippingFee,
    } = await req.json();

    console.log({ taxRate, shippingFee });

    if (!id) {
      return NextResponse.json(
        { message: "Invoice ID is required" },
        { status: 400 }
      );
    }

    // Validate the status if it's provided
    if (status && !isValidInvoiceStatus(status)) {
      return NextResponse.json(
        { message: "Invalid invoice status" },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (customerName !== undefined) updateData.customerName = customerName;
    if (customerEmail !== undefined) updateData.customerEmail = customerEmail;
    if (customerPhone !== undefined) updateData.customerPhone = customerPhone;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (status !== undefined) updateData.status = status;
    if (amount !== undefined) updateData.amount = amount;
    if (taxRate !== undefined) updateData.taxRate = taxRate;
    if (shippingFee !== undefined) updateData.shippingFee = shippingFee;
    if (discountPercentage !== undefined)
      updateData.discountPercentage = discountPercentage;

    // Check if there's any data to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: "No fields to update provided" },
        { status: 400 }
      );
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
              Product: {
                connect: { id: product.id },
              },
            },
          });
        }
      }

      return prisma.invoice.findUnique({
        where: { id },
        include: {
          InvoiceProducts: {
            include: {
              Product: true,
            },
          },
        },
      });
    });

    if (!updatedInvoice) {
      return NextResponse.json(
        { message: "Invoice not found" },
        { status: 404 }
      );
    }

    const transformedInvoice = {
      ...updatedInvoice,
      products: updatedInvoice.InvoiceProducts.map((ip) => ({
        id: ip.Product[0]?.id,
        name: ip.Product[0]?.name,
        basePrice: ip.basePrice,
        quantity: ip.quantity,
      })),
    };

    return NextResponse.json({
      data: transformedInvoice,
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

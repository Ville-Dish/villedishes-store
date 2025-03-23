import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";

// POST method to create a new product
export async function POST(req: Request) {
  try {
    const { name, description, price, image, category, rating } =
      await req.json();

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price,
        image,
        category,
        rating,
      },
    });

    return NextResponse.json({
      data: newProduct,
      message: "Product Added Successfully",
      status: 201,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error adding product", error },
      { status: 500 }
    );
  }
}

// GET method to retrieve all products
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        OrderProduct: true, // Assuming you want to include related order products
      },
    });

    return NextResponse.json({
      data: products,
      message: "Products retrieved successfully",
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error retrieving products", error },
      { status: 500 }
    );
  }
}

// PATCH method to update a product
export async function PATCH(req: Request) {
  try {
    const { id, name, description, price, category, image, rating } =
      await req.json();

    // Define the type for updateData using Partial and your Prisma model
    const updateData: Partial<{
      name: string;
      description: string;
      price: number;
      category: string;
      image: string;
      rating: number;
    }> = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (category !== undefined) updateData.category = category;
    if (image !== undefined) updateData.image = image;
    if (rating !== undefined) updateData.rating = rating;

    // Check if there's any data to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: "No fields to update provided" },
        { status: 400 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      data: updatedProduct,
      message: "Product updated successfully",
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating product", error },
      { status: 500 }
    );
  }
}

// DELETE method to delete a product
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    const deletedProduct = await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      data: deletedProduct,
      message: "Product deleted successfully",
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting product", error },
      { status: 500 }
    );
  }
}

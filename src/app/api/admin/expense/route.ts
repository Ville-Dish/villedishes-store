import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany();
    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, category, amount, date } = await request.json();
    const expense = await prisma.expense.create({
      data: {
        name,
        category,
        amount,
        date,
      },
    });
    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error("Failed to create expense:", error);
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, category, amount, date } = await request.json();
    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: {
        name,
        category,
        amount,
        date,
      },
    });
    return NextResponse.json(updatedExpense);
  } catch (error) {
    console.error("Failed to update expense:", error);
    return NextResponse.json(
      { error: "Failed to update expense" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await prisma.expense.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Failed to delete expense:", error);
    return NextResponse.json(
      { error: "Failed to delete expense" },
      { status: 500 }
    );
  }
}

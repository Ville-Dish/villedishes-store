import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";

export async function GET() {
  try {
    const incomes = await prisma.income.findMany();
    return NextResponse.json(incomes);
  } catch (error) {
    console.error("Failed to fetch incomes:", error);
    return NextResponse.json(
      { error: "Failed to fetch incomes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, category, amount, date } = await request.json();
    const income = await prisma.income.create({
      data: {
        name,
        category,
        amount,
        date,
      },
    });
    return NextResponse.json(income, { status: 201 });
  } catch (error) {
    console.error("Failed to create income:", error);
    return NextResponse.json(
      { error: "Failed to create income" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, category, amount, date } = await request.json();
    const updatedIncome = await prisma.income.update({
      where: { id },
      data: {
        name,
        category,
        amount,
        date,
      },
    });
    return NextResponse.json(updatedIncome);
  } catch (error) {
    console.error("Failed to update income:", error);
    return NextResponse.json(
      { error: "Failed to update income" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await prisma.income.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Income deleted successfully" });
  } catch (error) {
    console.error("Failed to delete income:", error);
    return NextResponse.json(
      { error: "Failed to delete income" },
      { status: 500 }
    );
  }
}

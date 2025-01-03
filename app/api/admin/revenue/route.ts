import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { calculateMonthlyRevenue } from "@/lib/financeUtils";

type MonthlyProjection = {
  id: string;
  month: string;
  projection: number;
  actual: number;
};

export async function GET() {
  try {
    const revenues = await prisma.revenue.findMany({
      include: {
        monthlyProjections: true,
      },
    });

    const updatedRevenues = await Promise.all(
      revenues.map(async (revenue) => {
        const updatedMonthlyProjections = await Promise.all(
          revenue.monthlyProjections.map(async (mp) => {
            const monthIndex =
              [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].indexOf(mp.month) + 1;

            const calculatedActual = await calculateMonthlyRevenue(
              revenue.year,
              monthIndex
            );

            return {
              ...mp,
              actual: calculatedActual,
            };
          })
        );

        return {
          ...revenue,
          monthlyProjections: updatedMonthlyProjections,
        };
      })
    );

    return NextResponse.json(updatedRevenues);
  } catch (error) {
    console.error("Failed to fetch revenues:", error);
    return NextResponse.json(
      { error: "Failed to fetch revenues" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { year, yearlyTarget, monthlyProjections } = await request.json();

    // Validate the input
    if (
      !year ||
      !yearlyTarget ||
      !Array.isArray(monthlyProjections) ||
      monthlyProjections.length === 0
    ) {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }

    // Ensure each monthlyProjection has the required fields
    const validMonthlyProjections = monthlyProjections.map((mp) => ({
      month: mp.month,
      projection: mp.projection,
      actual: mp.actual || 0, // Default to 0 if not provided
    }));

    const revenue = await prisma.revenue.create({
      data: {
        year,
        yearlyTarget,
        monthlyProjections: {
          create: validMonthlyProjections,
        },
      },
      include: {
        monthlyProjections: true,
      },
    });
    return NextResponse.json(revenue, { status: 201 });
  } catch (error) {
    console.error("Failed to create revenue:", error);
    return NextResponse.json(
      { error: "Failed to create revenue" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, year, yearlyTarget, monthlyProjections } = await request.json();
    const updatedRevenue = await prisma.revenue.update({
      where: { id },
      data: {
        year,
        yearlyTarget,
        monthlyProjections: {
          upsert: monthlyProjections.map((mp: MonthlyProjection) => ({
            where: {
              id: mp.id ?? "",
            },
            create: {
              month: mp.month,
              projection: mp.projection,
              actual: mp.actual,
            },
            update: {
              projection: mp.projection,
              // We don't update the 'actual' field here as it's calculated
            },
          })),
        },
      },
      include: {
        monthlyProjections: true,
      },
    });

    // Recalculate actual values
    const recalculatedProjections = await Promise.all(
      updatedRevenue.monthlyProjections.map(async (mp) => {
        const monthIndex =
          [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ].indexOf(mp.month) + 1;

        const calculatedActual = await calculateMonthlyRevenue(
          updatedRevenue.year,
          monthIndex
        );

        return {
          ...mp,
          actual: calculatedActual,
        };
      })
    );

    // Update the revenue with recalculated projections
    const finalRevenue = await prisma.revenue.update({
      where: { id },
      data: {
        monthlyProjections: {
          updateMany: recalculatedProjections.map((mp) => ({
            where: { id: mp.id },
            data: { actual: mp.actual },
          })),
        },
      },
      include: {
        monthlyProjections: true,
      },
    });

    return NextResponse.json(finalRevenue);
  } catch (error) {
    console.error("Failed to update revenue:", error);
    return NextResponse.json(
      { error: "Failed to update revenue" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await prisma.revenue.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Revenue deleted successfully" });
  } catch (error) {
    console.error("Failed to delete revenue:", error);
    return NextResponse.json(
      { error: "Failed to delete revenue" },
      { status: 500 }
    );
  }
}

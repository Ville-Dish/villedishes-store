"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

type ChartVariant = "Revenue" | "Income" | "Expense" | "Profit";

interface RevenueData {
  projected: number;
  actual: number;
}

interface CategoryData {
  category: string;
  value: number;
}

interface ProfitData {
  totalRevenue: number;
  profit: number;
}

interface PieChartProps {
  variant: ChartVariant;
  data: RevenueData | CategoryData[] | ProfitData;
}

const COLORS = {
  Revenue: ["hsl(var(--chart-1))", "hsl(var(--chart-2))"],
  Income: [
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--chart-6))",
  ],
  Expense: [
    "hsl(var(--chart-7))",
    "hsl(var(--chart-8))",
    "hsl(var(--chart-9))",
    "hsl(var(--chart-10))",
  ],
  Profit: ["hsl(var(--chart-11))", "hsl(var(--chart-12))"],
};

export const AnalyticsPieChart = ({ variant, data }: PieChartProps) => {
  const isRevenue = variant === "Revenue";
  const isProfit = variant === "Profit";

  const chartData = isRevenue
    ? [
        { name: "Actual", value: (data as RevenueData).actual },
        {
          name: "Projected",
          value: (data as RevenueData).projected - (data as RevenueData).actual,
        },
      ]
    : isProfit
    ? [
        { name: "Profit", value: (data as ProfitData).profit },
        {
          name: "Revenue",
          value: (data as ProfitData).totalRevenue,
        },
      ]
    : (data as CategoryData[]).map((item) => ({
        name: item.category,
        value: item.value,
      }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[variant][index % COLORS[variant].length]}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => `${value.toFixed(2)}`}
          labelFormatter={(name) => `${name}`}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

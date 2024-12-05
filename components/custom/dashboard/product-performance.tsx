"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#FE9E1D", "#DA281C", "#AA8865", "#FFF1E2", "#1AA879"];

export const ProductPerformance = ({ data }: productPerformanceProps) => {
  // const total = data.reduce((sum, entry) => sum + entry.value, 0);

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
    index: number;
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    const percentValue = (percent * 100).toFixed(0);
    const textColor =
      COLORS[index % COLORS.length] === "#FFF1E2" ? "#000000" : "#FFFFFF";

    return (
      <text
        x={x}
        y={y}
        fill={textColor}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${percentValue}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={renderCustomizedLabel}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => `${value}`}
          labelFormatter={(label) => `${label}`}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

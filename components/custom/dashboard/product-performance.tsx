"use client";

import {
  Cell,
  Pie,
  PieChart,
  PieLabelRenderProps,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = ["#FE9E1D", "#DA281C", "#AA8865", "#FFF1E2", "#1AA879"];

export const ProductPerformance = ({ data }: productPerformanceProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-sm text-muted-foreground">
          No product performance data available
        </p>
      </div>
    );
  }

  // const renderCustomizedLabel = ({
  //   cx,
  //   cy,
  //   midAngle,
  //   innerRadius,
  //   outerRadius,
  //   percent,
  //   index,
  // }: {
  //   cx: number;
  //   cy: number;
  //   midAngle: number;
  //   innerRadius: number;
  //   outerRadius: number;
  //   percent: number;
  //   index: number;
  // }) => {
  const renderCustomizedLabel = (props: PieLabelRenderProps) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, index } =
      props;

    if (
      cx === null ||
      cy === null ||
      midAngle === null ||
      innerRadius === null ||
      outerRadius === null ||
      percent === null ||
      index === null
    ) {
      return null;
    }

    // Convert numbers safely
    const cxNum = Number(cx);
    const cyNum = Number(cy);
    const innerRadiusNum = Number(innerRadius);
    const outerRadiusNum =
      typeof outerRadius === "function"
        ? Number(outerRadius({}))
        : Number(outerRadius);
    const midAngleNum = Number(midAngle);
    const percentNum = Number(percent);

    const RADIAN = Math.PI / 180;
    const radius = innerRadiusNum + (outerRadiusNum - innerRadiusNum) * 0.5;
    const x = cxNum + radius * Math.cos(-midAngleNum * RADIAN);
    const y = cyNum + radius * Math.sin(-midAngleNum * RADIAN);

    const percentValue = (percentNum * 100).toFixed(0);
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
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius="90%"
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

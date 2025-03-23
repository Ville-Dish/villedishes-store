"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const RevenueGrowth = ({ data }: revenueGrowthProps) => {
  return (
    data && data.length > 0 ? (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    ) : (
      <div className="flex justify-center items-center h-full">
        <p className="text-sm text-muted-foreground">No revenue data available</p>
      </div>
    )
  );
};

"use client";

import { Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import { productPerformanceProps } from "@/lib/types";

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

  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Largest remainder method — guarantees sum === 100
  const rawPcts = data.map((item) => (item.value / total) * 100);
  const floored = rawPcts.map(Math.floor);
  const remainders = rawPcts.map((r, i) => ({ i, r: r - floored[i] }));
  const deficit = 100 - floored.reduce((a, b) => a + b, 0);
  remainders
    .sort((a, b) => b.r - a.r)
    .slice(0, deficit)
    .forEach(({ i }) => floored[i]++);

  const percentages = floored; // index-aligned with data

  // Build chartConfig and inject fill colors dynamically from data
  const chartConfig = {
    value: { label: "Units Sold" },
    ...Object.fromEntries(
      data.map((item, index) => [
        item.name,
        { label: item.name, color: COLORS[index % COLORS.length] },
      ]),
    ),
  } satisfies ChartConfig;

  // Inject fill so ChartContainer color tokens are used
  const chartData = data.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length],
  }));

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto size-full [&_.recharts-text]:fill-background"
    >
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              nameKey="name"
              className="font-medium"
              formatter={(value, name) => {
                const index = data.findIndex((d) => d.name === name);
                const color = COLORS[index % COLORS.length];
                const pct = percentages[index];
                return (
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-muted-foreground">{name}</span>
                    <span className="ml-auto font-bold">
                      {value}{" "}
                      <span className="text-muted-foreground font-normal">
                        ({pct}%)
                      </span>
                    </span>
                  </div>
                );
              }}
            />
          }
        />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          labelLine={false}
          label={({ cx, cy, midAngle, innerRadius, outerRadius, index }) => {
            if (
              cx === undefined ||
              cy === undefined ||
              midAngle === undefined ||
              innerRadius === undefined ||
              outerRadius === undefined
            )
              return null;

            const pct = percentages[index];
            if (Number(pct) < 5) return null; // skip tiny slices

            const RADIAN = Math.PI / 180;
            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
            const x = cx + radius * Math.cos(-midAngle * RADIAN);
            const y = cy + radius * Math.sin(-midAngle * RADIAN);

            const boxW = 30;
            const boxH = 18;

            return (
              <g>
                <rect
                  x={x - boxW / 2}
                  y={y - boxH / 2}
                  width={boxW}
                  height={boxH}
                  rx={4}
                  ry={4}
                  fill="rgba(0,0,0,0.55)"
                />
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={11}
                  fontWeight="bold"
                  fill="#ffffff"
                >
                  {pct}%
                </text>
              </g>
            );
          }}
        >
          {/* <LabelList
            // dataKey="name"
            className="fill-red-500 font-semibold text-sm"
            stroke="none"
            fontSize={12}
            // formatter={(value: RenderableText): RenderableText => {
            //   const key = String(value);
            //   const label = (chartConfig as ChartConfig)[key]?.label;
            //   return (label ?? key) as RenderableText;
            // }}
          /> */}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
};

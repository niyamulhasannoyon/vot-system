"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export interface ResultsBarChartProps {
  data: {
    name: string;
    votes: number;
    percentage: number;
    symbol: string;
  }[];
  colors: string[];
  locale: string;
  formatNum: (n: number) => string;
}

export default function ResultsBarChart({
  data,
  colors,
  locale,
  formatNum,
}: ResultsBarChartProps) {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="h-64 sm:h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
          <YAxis
            dataKey="name"
            type="category"
            width={110}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(val: any) => [
              `${formatNum(Number(val))} ${locale === "bn" ? "ভোট" : "votes"}`,
              locale === "bn" ? "ভোট সংখ্যা" : "Votes",
            ]}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              fontSize: "12px",
            }}
          />
          <Bar dataKey="votes" radius={[0, 8, 8, 0]}>
            {data.map((_, index: number) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

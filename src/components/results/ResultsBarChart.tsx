"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
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
  locale: string;
  isDark?: boolean;
  formatNum: (n: number) => string;
}

export default function ResultsBarChart({
  data,
  locale,
  isDark = false,
  formatNum,
}: ResultsBarChartProps) {
  if (!data || data.length === 0) {
    return null;
  }

  const maxVotes = Math.max(...data.map((d) => d.votes), 0);
  const accentColor = isDark ? "#10B981" : "#006A4E";
  const mutedBarColor = isDark ? "#475569" : "#CBD5E1";
  const tickColor = isDark ? "#94A3B8" : "#64748B";
  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0";

  return (
    <div className="h-64 sm:h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 24, left: 12, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fontSize: 12, fill: tickColor }}
            axisLine={{ stroke: gridColor }}
            tickLine={false}
          />
          <YAxis
            dataKey="name"
            type="category"
            width={116}
            tick={{ fontSize: 12, fill: tickColor }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.04)" }}
            formatter={(val) => {
              const numVal = typeof val === "number" ? val : Number(val ?? 0);
              return [
                `${formatNum(numVal)} ${locale === "bn" ? "ভোট" : "votes"}`,
                locale === "bn" ? "ভোট সংখ্যা" : "Votes",
              ];
            }}
            contentStyle={{
              borderRadius: "10px",
              border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e2e8f0",
              backgroundColor: isDark ? "#121721" : "#ffffff",
              color: isDark ? "#f1f5f9" : "#0f172a",
              boxShadow: "0 4px 12px rgb(0 0 0 / 0.08)",
              fontSize: "12px",
            }}
          />
          <Bar dataKey="votes" radius={[0, 6, 6, 0]} maxBarSize={36}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.votes === maxVotes && maxVotes > 0 ? accentColor : mutedBarColor}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

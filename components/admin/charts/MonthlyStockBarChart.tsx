"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DailyMovement {
  day: string;
  sales: number;
  restocks: number;
}

interface MonthlyStockBarChartProps {
  data: DailyMovement[];
  language: "en" | "zh";
}

export default function MonthlyStockBarChart({
  data,
  language,
}: MonthlyStockBarChartProps) {
  const text = {
    en: {
      sales: "Sales",
      restocks: "Restocks",
      quantity: "Quantity",
    },
    zh: {
      sales: "銷售",
      restocks: "補貨",
      quantity: "數量",
    },
  };

  const t = text[language];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="day"
          stroke="#6b7280"
          style={{ fontSize: "12px" }}
          interval={2}
        />
        <YAxis
          stroke="#6b7280"
          style={{ fontSize: "14px" }}
          label={{ value: t.quantity, angle: -90, position: "insideLeft" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "10px",
          }}
          cursor={{ fill: "rgba(134, 167, 156, 0.1)" }}
        />
        <Legend
          wrapperStyle={{ paddingTop: "20px" }}
          iconType="square"
        />
        <Bar
          dataKey="sales"
          name={t.sales}
          fill="#f59e0b"
          radius={[8, 8, 0, 0]}
        />
        <Bar
          dataKey="restocks"
          name={t.restocks}
          fill="#10b981"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

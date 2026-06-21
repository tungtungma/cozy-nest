"use client";

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

interface ProductPerformance {
  productEn: string;
  productZh: string;
  sold: number;
  revenue: number;
}

interface TopProductsBarChartProps {
  data: ProductPerformance[];
  language: "en" | "zh";
}

const BAR_COLOR = "#0f766e"; // teal-700

export default function TopProductsBarChart({
  data,
  language,
}: TopProductsBarChartProps) {
  const text = {
    en: {
      unitsSold: "units sold",
      revenue: "Revenue",
      noData: "No sales data in the last 30 days",
    },
    zh: {
      unitsSold: "件已售",
      revenue: "收入",
      noData: "過去30天無銷售數據",
    },
  };

  const t = text[language];

  // Sort by sold descending, include all
  const chartData = [...data]
    .sort((a, b) => b.sold - a.sold)
    .map((item) => ({
      name: language === "en" ? item.productEn : item.productZh,
      sold: item.sold,
      revenue: item.revenue,
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-teal/60">
        {t.noData}
      </div>
    );
  }

  // Dynamic height: 40px per bar + padding, min 300px
  const chartHeight = Math.max(300, chartData.length * 45 + 40);

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#e5e7eb"
          horizontal={false}
        />
        <XAxis
          type="number"
          stroke="#6b7280"
          style={{ fontSize: "12px" }}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          stroke="#6b7280"
          style={{ fontSize: "13px" }}
          width={140}
          tick={{ fill: "#374151" }}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "10px",
          }}
          cursor={{ fill: "rgba(15, 118, 110, 0.08)" }}
          formatter={(_value: number | undefined, _name: string | undefined, props: any) => [
            `${props.payload?.sold || 0} ${t.unitsSold}`,
            `${t.revenue}: HK$${props.payload?.revenue?.toLocaleString() || 0}`,
          ]}
        />
        <Bar
          dataKey="sold"
          radius={[0, 6, 6, 0]}
          barSize={20}
          label={{
            position: "right",
            fontSize: 12,
            fill: "#6b7280",
            formatter: (val: any) => `${val}`,
          }}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={BAR_COLOR} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

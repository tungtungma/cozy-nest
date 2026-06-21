"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface ProductPerformance {
  productEn: string;
  productZh: string;
  sold: number;
  revenue: number;
}

interface ProductPerformanceDonutProps {
  data: ProductPerformance[];
  language: "en" | "zh";
}

// 10-color palette — enough for top 5 + Other without repetition
const COLORS = [
  "#0f766e", // teal-700
  "#f59e0b", // amber-500
  "#6366f1", // indigo-500
  "#ec4899", // pink-500
  "#10b981", // emerald-500
  "#f97316", // orange-500
  "#8b5cf6", // violet-500
  "#14b8a6", // teal-400
  "#e11d48", // rose-600
  "#06b6d4", // cyan-500
];

export default function ProductPerformanceDonut({
  data,
  language,
}: ProductPerformanceDonutProps) {
  const text = {
    en: {
      title: "Product Sales Distribution",
      top5: "Top 5 Products",
      other: "Other",
      unitsSold: "units sold",
      revenue: "Revenue",
      noData: "No sales data in the last 30 days",
    },
    zh: {
      title: "產品銷售分佈",
      top5: "熱賣前5名",
      other: "其他",
      unitsSold: "件已售",
      revenue: "收入",
      noData: "過去30天無銷售數據",
    },
  };

  const t = text[language];

  // Sort by sold descending, take top 5, roll the rest into "Other"
  const sorted = [...data].sort((a, b) => b.sold - a.sold);
  const top5 = sorted.slice(0, 5);
  const rest = sorted.slice(5);

  const chartData = top5.map((item) => ({
    name: language === "en" ? item.productEn : item.productZh,
    value: item.sold,
    revenue: item.revenue,
  }));

  if (rest.length > 0) {
    const otherSold = rest.reduce((sum, item) => sum + item.sold, 0);
    const otherRevenue = rest.reduce((sum, item) => sum + item.revenue, 0);
    if (otherSold > 0) {
      chartData.push({
        name: t.other,
        value: otherSold,
        revenue: otherRevenue,
      });
    }
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-teal/60">
        {t.noData}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={95}
          fill="#8884d8"
          paddingAngle={3}
          dataKey="value"
          // No inline labels — legend + tooltip only for clean look
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "10px",
          }}
          formatter={(_value: any, _name: any, props: any) => {
            const pct =
              chartData.reduce((s, d) => s + d.value, 0) > 0
                ? ((props.payload?.value || 0) /
                    chartData.reduce((s, d) => s + d.value, 0)) *
                  100
                : 0;
            return [
              `${props.payload?.value || 0} ${t.unitsSold} (${pct.toFixed(0)}%) — HK$${props.payload?.revenue?.toLocaleString() || 0}`,
              props.payload?.name,
            ];
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          wrapperStyle={{ fontSize: "13px" }}
          formatter={(value: string) => (
            <span className="text-teal/80">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

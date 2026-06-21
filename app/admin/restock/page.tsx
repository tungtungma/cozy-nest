"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import MonthlyStockBarChart from "@/components/admin/charts/MonthlyStockBarChart";
import ProductPerformanceDonut from "@/components/admin/charts/ProductPerformanceDonut";
import TopProductsBarChart from "@/components/admin/charts/TopProductsBarChart";
import { format } from "date-fns";

interface MonthlyAnalytics {
  monthStats: {
    totalProducts: number;
    soldThisMonth: number;
    restockedThisMonth: number;
    lowStockCount: number;
  };
  lowStockProducts: Array<{
    id: string;
    nameEn: string;
    nameZh: string;
    stockQuantity: number;
    priceHkd: number;
  }>;
  dailyMovements: Array<{
    day: string;
    sales: number;
    restocks: number;
  }>;
  productPerformance: Array<{
    productEn: string;
    productZh: string;
    sold: number;
    revenue: number;
  }>;
  recentMovements: Array<{
    id: string;
    productName: string;
    productNameZh: string;
    type: string;
    quantity: number;
    previousStock: number;
    newStock: number;
    currentStock: number;
    createdAt: string;
    performedBy: string | null;
  }>;
  movementPagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export default function MonthlyRestockDashboard() {
  const { language } = useLanguage();
  const [analytics, setAnalytics] = useState<MonthlyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [movementPage, setMovementPage] = useState(1);

  useEffect(() => {
    fetchAnalytics();
  }, [movementPage]);

  const fetchAnalytics = async () => {
    try {
      const params = new URLSearchParams({
        movementPage: movementPage.toString(),
        movementLimit: "10",
      });
      const response = await fetch(`/api/admin/stock-analytics/monthly?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const t = {
    en: {
      title: "30-Day Restock Dashboard",
      subtitle: "Inventory Management & Analytics",
      totalProducts: "Total Products",
      soldThisMonth: "Sold (30 Days)",
      restockedThisMonth: "Restocked (30 Days)",
      lowStockItems: "Low Stock Items",
      monthlyMovement: "📊 30-Day Stock Movement",
      productPerformance: "🎯 Product Performance",
      lowStockAlert: "⚠️ Low Stock Alert",
      recentMovements: "📋 Recent Stock Movements",
      noLowStock: "All products have sufficient stock",
      noMovements: "No stock movements in the last 30 days",
      product: "Product",
      action: "Action",
      quantity: "Qty",
      stock: "Stock",
      date: "Date",
      sale: "Sale",
      restock: "Restock",
      adjustment: "Adjustment",
      left: "left",
    },
    zh: {
      title: "30天補貨儀表板",
      subtitle: "庫存管理與分析",
      totalProducts: "總產品數",
      soldThisMonth: "30天已售",
      restockedThisMonth: "30天已補貨",
      lowStockItems: "低庫存商品",
      monthlyMovement: "📊 30天庫存變動",
      productPerformance: "🎯 產品表現",
      lowStockAlert: "⚠️ 低庫存警示",
      recentMovements: "📋 最近庫存變動",
      noLowStock: "所有產品庫存充足",
      noMovements: "過去30天無庫存變動",
      product: "產品",
      action: "操作",
      quantity: "數量",
      stock: "庫存",
      date: "日期",
      sale: "銷售",
      restock: "補貨",
      adjustment: "調整",
      left: "剩餘",
    },
  };

  const text = t[language];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal mx-auto mb-4"></div>
          <p className="text-xl text-teal/70 font-lora">
            {language === "en" ? "Loading..." : "載入中..."}
          </p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-teal/70 font-lora">
          {language === "en" ? "Failed to load analytics" : "載入失敗"}
        </p>
      </div>
    );
  }

  const getActionColor = (type: string) => {
    switch (type) {
      case "sale":
        return "bg-amber-100 text-amber-700";
      case "restock":
        return "bg-green-100 text-green-700";
      case "adjustment":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getActionText = (type: string) => {
    switch (type) {
      case "sale":
        return text.sale;
      case "restock":
        return text.restock;
      case "adjustment":
        return text.adjustment;
      default:
        return type;
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-playfair font-bold text-teal mb-2">
          {text.title}
        </h1>
        <p className="text-lg font-lora text-teal/70">{text.subtitle}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Products */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-teal">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-lora font-semibold text-teal/70 uppercase">
              {text.totalProducts}
            </h3>
            <span className="text-3xl">📦</span>
          </div>
          <p className="text-4xl font-playfair font-bold text-teal">
            {analytics.monthStats.totalProducts}
          </p>
        </div>

        {/* Sold This Month */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-amber">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-lora font-semibold text-amber-700 uppercase">
              {text.soldThisMonth}
            </h3>
            <span className="text-3xl">📤</span>
          </div>
          <p className="text-4xl font-playfair font-bold text-amber-700">
            {analytics.monthStats.soldThisMonth}
          </p>
        </div>

        {/* Restocked This Month */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-lora font-semibold text-green-700 uppercase">
              {text.restockedThisMonth}
            </h3>
            <span className="text-3xl">📥</span>
          </div>
          <p className="text-4xl font-playfair font-bold text-green-700">
            {analytics.monthStats.restockedThisMonth}
          </p>
        </div>

        {/* Low Stock Items */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-lora font-semibold text-red-700 uppercase">
              {text.lowStockItems}
            </h3>
            <span className="text-3xl">⚠️</span>
          </div>
          <p className="text-4xl font-playfair font-bold text-red-700">
            {analytics.monthStats.lowStockCount}
          </p>
        </div>
      </div>

      {/* Monthly Movement Chart — full width */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
        <h2 className="text-2xl font-playfair font-bold text-teal mb-6">
          {text.monthlyMovement}
        </h2>
        <MonthlyStockBarChart
          data={analytics.dailyMovements}
          language={language}
        />
      </div>

      {/* Product Performance Section */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-playfair font-bold text-teal">
            {text.productPerformance}
          </h2>
          <span className="text-sm text-teal/50 font-lora">
            {language === "en" ? "Ranked by units sold" : "按銷售量排名"}
          </span>
        </div>
        {/* Primary: horizontal bar chart — all products ranked */}
        <TopProductsBarChart
          data={analytics.productPerformance}
          language={language}
        />
        {/* Compact donut summary — top 5 + other */}
        <div className="mt-8 pt-6 border-t border-teal/10">
          <h3 className="text-sm font-lora font-semibold text-teal/60 uppercase mb-4">
            {language === "en" ? "Top 5 Distribution" : "前5名分佈"}
          </h3>
          <div className="max-w-md mx-auto">
            <ProductPerformanceDonut
              data={analytics.productPerformance}
              language={language}
            />
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {analytics.lowStockProducts.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <h2 className="text-2xl font-playfair font-bold text-teal mb-6">
            {text.lowStockAlert}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200"
              >
                <div>
                  <h3 className="font-lora font-semibold text-teal">
                    {language === "en" ? product.nameEn : product.nameZh}
                  </h3>
                  <p className="text-sm text-teal/70">
                    HK${product.priceHkd.toLocaleString()}
                  </p>
                </div>
                <span className="inline-block px-3 py-1 rounded-lg text-sm font-semibold bg-red-100 text-red-700">
                  {product.stockQuantity} {text.left}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Movements Table */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-playfair font-bold text-teal">
            {text.recentMovements}
          </h2>
          {analytics.movementPagination && (
            <span className="text-sm text-teal/50 font-lora">
              {language === "en" ? "Page" : "第"}{analytics.movementPagination.page} {language === "en" ? "of" : "/"}{analytics.movementPagination.totalPages} ({analytics.movementPagination.totalCount} {language === "en" ? "total" : "筆"})
            </span>
          )}
        </div>
        {analytics.recentMovements.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-teal/20">
                    <th className="text-left p-3 font-lora font-semibold text-teal">
                      {text.product}
                    </th>
                    <th className="text-left p-3 font-lora font-semibold text-teal">
                      {text.action}
                    </th>
                    <th className="text-right p-3 font-lora font-semibold text-teal">
                      {text.quantity}
                    </th>
                    <th className="text-right p-3 font-lora font-semibold text-teal">
                      {text.stock}
                    </th>
                    <th className="text-left p-3 font-lora font-semibold text-teal">
                      {text.date}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentMovements.map((movement) => (
                    <tr key={movement.id} className="border-b border-teal/10">
                      <td className="p-3">
                        <div className="font-lora text-teal font-semibold">
                          {language === "en"
                            ? movement.productName
                            : movement.productNameZh}
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getActionColor(
                            movement.type
                          )}`}
                        >
                          {getActionText(movement.type)}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono">
                        <span
                          className={
                            movement.quantity > 0
                              ? "text-green-600"
                              : "text-amber-600"
                          }
                        >
                          {movement.quantity > 0 ? "+" : ""}
                          {movement.quantity}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono text-teal/70">
                        {movement.currentStock} {text.left}
                      </td>
                      <td className="p-3 text-sm text-teal/60">
                        {format(
                          new Date(movement.createdAt),
                          "MMM dd, hh:mm a"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination Controls */}
            {analytics.movementPagination && analytics.movementPagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-teal/10">
                <button
                  onClick={() => setMovementPage(1)}
                  disabled={!analytics.movementPagination.hasPreviousPage}
                  className="px-3 py-1.5 text-sm font-lora rounded-lg border border-teal/20 text-teal/60 hover:bg-teal/5 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ««
                </button>
                <button
                  onClick={() => setMovementPage(movementPage - 1)}
                  disabled={!analytics.movementPagination.hasPreviousPage}
                  className="px-3 py-1.5 text-sm font-lora rounded-lg border border-teal/20 text-teal/60 hover:bg-teal/5 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  «
                </button>
                {Array.from({ length: analytics.movementPagination.totalPages }, (_, i) => i + 1)
                  .filter(p => {
                    const total = analytics.movementPagination.totalPages;
                    // Show first, last, current, and neighbors (±1)
                    return p === 1 || p === total || Math.abs(p - movementPage) <= 1;
                  })
                  .map((p, idx, arr) => (
                    <span key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-1 text-teal/30">…</span>
                      )}
                      <button
                        onClick={() => setMovementPage(p)}
                        className={`px-3 py-1.5 text-sm font-lora rounded-lg ${
                          p === movementPage
                            ? "bg-teal text-white"
                            : "border border-teal/20 text-teal/60 hover:bg-teal/5"
                        }`}
                      >
                        {p}
                      </button>
                    </span>
                  ))}
                <button
                  onClick={() => setMovementPage(movementPage + 1)}
                  disabled={!analytics.movementPagination.hasNextPage}
                  className="px-3 py-1.5 text-sm font-lora rounded-lg border border-teal/20 text-teal/60 hover:bg-teal/5 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  »
                </button>
                <button
                  onClick={() => setMovementPage(analytics.movementPagination.totalPages)}
                  disabled={!analytics.movementPagination.hasNextPage}
                  className="px-3 py-1.5 text-sm font-lora rounded-lg border border-teal/20 text-teal/60 hover:bg-teal/5 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  »»
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-teal/60 py-8">{text.noMovements}</p>
        )}
      </div>
    </div>
  );
}

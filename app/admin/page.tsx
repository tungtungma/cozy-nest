"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalOrders: number;
  pendingOrders: number;
  pendingMembers: number;
  totalMembers: number;
  lowStockItems: {
    id: string;
    nameEn: string;
    nameZh: string;
    stockQuantity: number;
    inStock: boolean;
  }[];
  recentOrders: {
    orderNumber: string;
    status: string;
    total: string;
    orderedAt: string;
    user: {
      name: string | null;
      email: string;
    };
  }[];
  recentStockMovements: {
    id: string;
    type: string;
    quantity: number;
    previousStock: number;
    newStock: number;
    createdAt: string;
    product: {
      nameEn: string;
      nameZh: string;
    };
  }[];
}

export default function AdminDashboard() {
  const { language } = useLanguage();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/dashboard-stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const t = {
    en: {
      title: "Admin Dashboard",
      subtitle: "桐媽靚湯 Premium Seafood Management",
      totalProducts: "Total Products",
      lowStock: "Low Stock",
      outOfStock: "out of stock",
      totalOrders: "Total Orders",
      members: "Members",
      pendingApproval: "pending approval",
      manageProducts: "Manage Products",
      viewOrders: "View Orders",
      lowStockAlert: "⚠️ Low Stock Alert",
      viewAll: "View All",
      recentOrders: "📋 Recent Orders",
      left: "left",
      allProductsSufficient: "All products have sufficient stock",
      noOrders: "No orders yet",
      recentStockMovements: "📊 Recent Stock Movements",
      noStockMovements: "No stock movements yet",
      sale: "Sale",
      restock: "Restock",
      adjustment: "Adjustment",
      pending: "pending",
      confirmed: "confirmed",
      delivered: "delivered"
    },
    zh: {
      title: "管理後台",
      subtitle: "桐媽靚湯 優質海味管理系統",
      totalProducts: "總產品數",
      lowStock: "低庫存",
      outOfStock: "缺貨",
      totalOrders: "總訂單數",
      members: "會員",
      pendingApproval: "待審核",
      manageProducts: "管理產品",
      viewOrders: "查看訂單",
      lowStockAlert: "⚠️ 低庫存警示",
      viewAll: "查看全部",
      recentOrders: "📋 最近訂單",
      left: "剩餘",
      allProductsSufficient: "所有產品庫存充足",
      noOrders: "暫無訂單",
      recentStockMovements: "📊 最近庫存變動",
      noStockMovements: "暫無庫存變動",
      sale: "銷售",
      restock: "補貨",
      adjustment: "調整",
      pending: "待處理",
      confirmed: "已確認",
      delivered: "已送達"
    }
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

  if (!stats) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-teal/70 font-lora">
          {language === "en" ? "Failed to load dashboard" : "載入失敗"}
        </p>
      </div>
    );
  }

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
        {/* Products */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-teal">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-lora font-semibold text-teal/70 uppercase">
              {text.totalProducts}
            </h3>
            <span className="text-3xl">📦</span>
          </div>
          <p className="text-4xl font-playfair font-bold text-teal">
            {stats.totalProducts}
          </p>
          <Link
            href="/admin/products"
            className="text-sm text-teal hover:underline mt-2 inline-block"
          >
            {text.manageProducts} →
          </Link>
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-amber">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-lora font-semibold text-amber-700 uppercase">
              {text.lowStock}
            </h3>
            <span className="text-3xl">⚠️</span>
          </div>
          <p className="text-4xl font-playfair font-bold text-amber-700">
            {stats.lowStockProducts}
          </p>
          <p className="text-sm text-amber-600 mt-1">
            {stats.outOfStockProducts} {text.outOfStock}
          </p>
        </div>

        {/* Orders */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-sage">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-lora font-semibold text-sage-dark uppercase">
              {text.totalOrders}
            </h3>
            <span className="text-3xl">📋</span>
          </div>
          <p className="text-4xl font-playfair font-bold text-sage-dark">
            {stats.totalOrders}
          </p>
          <Link
            href="/admin/orders"
            className="text-sm text-sage-dark hover:underline mt-2 inline-block"
          >
            {text.viewOrders} →
          </Link>
        </div>

        {/* Members */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-lora font-semibold text-purple-700 uppercase">
              {text.members}
            </h3>
            <span className="text-3xl">👥</span>
          </div>
          <p className="text-4xl font-playfair font-bold text-purple-700">
            {stats.totalMembers}
          </p>
          <p className="text-sm text-purple-600 mt-1">
            {stats.pendingMembers} {text.pendingApproval}
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Stock Movements */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-playfair font-bold text-teal">
              {text.recentStockMovements}
            </h2>
            <Link
              href="/admin/products"
              className="text-sm text-teal hover:underline"
            >
              {text.viewAll} →
            </Link>
          </div>

          {stats.recentStockMovements && stats.recentStockMovements.length > 0 ? (
            <div className="space-y-2">
              {stats.recentStockMovements.slice(0, 6).map((movement) => (
                <div
                  key={movement.id}
                  className="p-2 bg-cream/50 rounded-lg border border-teal/10"
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1">
                      <p className="font-lora text-teal font-semibold text-xs">
                        {language === "en" ? movement.product.nameEn : movement.product.nameZh}
                      </p>
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-xs font-semibold mt-0.5 ${
                          movement.type === "sale"
                            ? "bg-red-100 text-red-700"
                            : movement.type === "restock"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {text[movement.type as keyof typeof text] || movement.type}
                      </span>
                    </div>
                    <span
                      className={`font-playfair font-bold text-base ml-2 ${
                        movement.quantity > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {movement.quantity > 0 ? "+" : ""}
                      {movement.quantity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-teal/60">
                    <span className="font-mono text-xs">
                      {movement.previousStock} → {movement.newStock}
                    </span>
                    <span className="text-xs">
                      {new Date(movement.createdAt).toLocaleDateString(
                        language === "en" ? "en-HK" : "zh-HK",
                        {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-teal/60 py-8">{text.noStockMovements}</p>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-playfair font-bold text-teal">
              {text.recentOrders}
            </h2>
            <Link
              href="/admin/orders"
              className="text-sm text-teal hover:underline"
            >
              {text.viewAll} →
            </Link>
          </div>

          {stats.recentOrders.length > 0 ? (
            <div className="space-y-4">
              {stats.recentOrders.map((order) => (
                <div
                  key={order.orderNumber}
                  className="flex items-center justify-between p-4 bg-cream rounded-xl"
                >
                  <div>
                    <h3 className="font-lora font-semibold text-teal">
                      {order.orderNumber}
                    </h3>
                    <p className="text-sm text-teal/70">
                      {order.user.name || order.user.email}
                    </p>
                    <p className="text-xs text-teal/50 mt-1">
                      {new Date(order.orderedAt).toLocaleDateString(
                        language === "en" ? "en-HK" : "zh-HK",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-playfair font-bold text-teal">
                      ${order.total}
                    </p>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold mt-1 ${
                        order.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : order.status === "confirmed"
                          ? "bg-blue-100 text-blue-700"
                          : order.status === "delivered"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {text[order.status as keyof typeof text] || order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-teal/60 py-8">{text.noOrders}</p>
          )}
        </div>
      </div>

      {/* Low Stock Alert */}
      <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-playfair font-bold text-teal">
            {text.lowStockAlert}
          </h2>
          <Link
            href="/admin/products"
            className="text-sm text-teal hover:underline"
          >
            {text.viewAll} →
          </Link>
        </div>

        {stats.lowStockItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.lowStockItems.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200"
              >
                <div>
                  <h3 className="font-lora font-semibold text-teal">
                    {language === "en" ? product.nameEn : product.nameZh}
                  </h3>
                  <p className="text-sm text-teal/70">
                    {language === "en" ? product.nameZh : product.nameEn}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold ${
                      product.stockQuantity === 0
                        ? "bg-red-100 text-red-700"
                        : product.stockQuantity <= 5
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {product.stockQuantity} {text.left}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-teal/60 py-8">
            {text.allProductsSufficient}
          </p>
        )}
      </div>
    </div>
  );
}

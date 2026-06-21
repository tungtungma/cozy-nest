"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { Package, ShoppingBag, Users, AlertTriangle } from "lucide-react";

interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  totalOrders: number;
  pendingOrders: number;
  pendingMembers: number;
  totalMembers: number;
  lowStockItems: { id: string; nameEn: string; nameZh: string; stockQuantity: number }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const { language } = useLanguage();

  useEffect(() => {
    fetch("/api/admin/dashboard-stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  const cards = [
    { label: "Products", value: stats?.totalProducts ?? "-", icon: Package, href: "/admin/products", color: "text-accent" },
    { label: "Orders", value: stats?.totalOrders ?? "-", icon: ShoppingBag, href: "/admin/orders", color: "text-foreground" },
    { label: "Members", value: stats?.totalMembers ?? "-", icon: Users, href: "/admin/members", color: "text-foreground" },
    { label: "Low Stock", value: stats?.lowStockProducts ?? "-", icon: AlertTriangle, href: "/admin/restock", color: "text-red-600" },
  ];

  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-serif text-3xl text-foreground mb-1">
          {language === "en" ? "Dashboard" : "儀表板"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {language === "en" ? "Cozy Nest admin overview" : "Cozy Nest 管理概覽"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="block p-6 bg-cream/40 rounded-lg hover:bg-cream transition border border-border/40">
            <div className="flex items-center justify-between mb-4">
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <p className="font-serif text-3xl text-foreground">{card.value}</p>
            <p className="text-xs tracking-wider uppercase text-muted-foreground mt-1">{card.label}</p>
          </Link>
        ))}
      </div>

      {stats?.pendingMembers ? (
        <div className="p-6 bg-cream/30 rounded-lg border border-border/40">
          <p className="text-sm text-foreground mb-1">{language === "en" ? "Pending members" : "待審核會員"}</p>
          <p className="font-serif text-2xl text-accent">{stats.pendingMembers}</p>
        </div>
      ) : null}
    </div>
  );
}

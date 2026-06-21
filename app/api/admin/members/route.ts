export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

// GET /api/admin/members - Get users with search + role filtering (admin only)
export async function GET(request: NextRequest) {
  try {
    // OPTIMIZATION: Use auth helper to avoid duplicate user query
    const authResult = await requireAdmin();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search")?.trim() || null;
    const role = searchParams.get("role") || "all";

    // Build where clause — AND wrapper so search OR composes with role AND filter
    const whereClause: any = {};
    const andConditions: any[] = [];

    if (role !== "all") {
      andConditions.push({ role });
    }

    if (search) {
      andConditions.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    if (andConditions.length > 0) {
      whereClause.AND = andConditions;
    }

    // Unfiltered stats — same as Orders page pattern
    const [totalUsers, pendingCount, memberCount, adminCount] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "pending" } }),
      prisma.user.count({ where: { role: "member" } }),
      prisma.user.count({ where: { role: "admin" } }),
    ]);

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        approvedAt: true,
        approvedBy: true,
        // VIP Tier fields — tier is stored, but spend is computed below from delivered orders
        tier: true,
        tierAchievedAt: true,
        currentCycleSpend: true,   // kept for type compatibility, overridden below
        lifetimeSpend: true,       // kept for type compatibility, overridden below
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Compute spend from delivered orders instead of trusting stored fields.
    // Stored fields are unreliable — Airwallex webhook updates them, but FPS
    // payments and manual admin status changes never do.
    const userIds = users.map((u) => u.id);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const validOrders = await prisma.order.findMany({
      where: {
        userId: { in: userIds },
        status: { not: "cancelled" },
      },
      select: {
        userId: true,
        total: true,
        orderedAt: true,
      },
    });

    // Aggregate spend per user
    const spendByUser = new Map<string, { lifetime: number; cycle: number }>();
    for (const order of validOrders) {
      const total = parseFloat(order.total.toString());
      const entry = spendByUser.get(order.userId) || { lifetime: 0, cycle: 0 };
      entry.lifetime += total;
      if (new Date(order.orderedAt) >= oneYearAgo) {
        entry.cycle += total;
      }
      spendByUser.set(order.userId, entry);
    }

    // Override stored spend with computed values, then sort by lifetime spend descending
    const usersWithSpend = users
      .map((user) => {
        const spend = spendByUser.get(user.id) || { lifetime: 0, cycle: 0 };
        return {
          ...user,
          lifetimeSpend: spend.lifetime.toFixed(2),
          currentCycleSpend: spend.cycle.toFixed(2),
        };
      })
      .sort((a, b) => parseFloat(b.lifetimeSpend) - parseFloat(a.lifetimeSpend));

    return NextResponse.json({
      users: usersWithSpend,
      stats: {
        total: totalUsers,
        pending: pendingCount,
        member: memberCount,
        admin: adminCount,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

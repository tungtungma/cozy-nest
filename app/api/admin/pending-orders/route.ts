export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

// GET /api/admin/pending-orders - Get all orders with pending payments (Admin only)
export async function GET(request: NextRequest) {
  try {
    // OPTIMIZATION: Use auth helper to avoid duplicate user query
    const authResult = await requireAdmin();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    // Get all orders with pending payments
    const pendingOrders = await prisma.order.findMany({
      where: {
        OR: [
          { status: "pending" },
          {
            payment: {
              status: "pending",
            },
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        payment: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                nameEn: true,
                nameZh: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        orderedAt: "desc",
      },
    });

    // Format response
    const formattedOrders = pendingOrders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customer: {
        name: order.user.name,
        email: order.user.email,
      },
      total: order.total,
      orderStatus: order.status,
      paymentStatus: order.payment?.status || "N/A",
      paymentMethod: order.payment?.paymentMethod || "N/A",
      deliveryMethod: order.deliveryMethod,
      orderedAt: order.orderedAt,
      itemCount: order.items.length,
      items: order.items.map((item) => ({
        productName: {
          en: item.product.nameEn,
          zh: item.product.nameZh,
        },
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
    }));

    return NextResponse.json({
      success: true,
      count: formattedOrders.length,
      orders: formattedOrders,
    });
  } catch (error) {
    console.error("Error fetching pending orders:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch pending orders",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

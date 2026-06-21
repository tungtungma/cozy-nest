export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/orders/[orderId]
 * Fetch order details by orderId or orderNumber
 * Used by success page to display actual order data from database
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Try to find order by ID first, then by orderNumber
    let order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                nameEn: true,
                nameZh: true,
                imageUrl: true,
              },
            },
          },
        },
        payment: {
          select: {
            paymentMethod: true,
            amount: true,
            status: true,
            paidAt: true,
          },
        },
      },
    });

    // If not found by ID, try orderNumber
    if (!order) {
      order = await prisma.order.findUnique({
        where: { orderNumber: orderId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  nameEn: true,
                  nameZh: true,
                  imageUrl: true,
                },
              },
            },
          },
          payment: {
            select: {
              paymentMethod: true,
              amount: true,
              status: true,
              paidAt: true,
            },
          },
        },
      });
    }

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Return sanitized order data (no sensitive info)
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        total: order.total,
        status: order.status,
        deliveryMethod: order.deliveryMethod,
        orderedAt: order.orderedAt,
        items: order.items.map((item) => ({
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          product: item.product,
        })),
        payment: order.payment
          ? {
              paymentMethod: order.payment.paymentMethod,
              amount: order.payment.amount,
              status: order.payment.status,
              paidAt: order.payment.paidAt,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

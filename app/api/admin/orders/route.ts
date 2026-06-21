export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import type { Prisma } from "@prisma/client";

const ORDER_DETAIL_SELECT = {
  id: true,
  orderNumber: true,
  status: true,
  subtotal: true,
  deliveryFee: true,
  total: true,
  deliveryMethod: true,
  deliveryAddress: true,
  orderedAt: true,
  customerNote: true,
  user: {
    select: {
      name: true,
      email: true,
    },
  },
  items: {
    include: {
      product: {
        select: {
          nameEn: true,
          nameZh: true,
        },
      },
    },
  },
  payment: {
    select: {
      paymentMethod: true,
      status: true,
      paymentReceiptUrl: true,
      receiptUploadedAt: true,
    },
  },
} as const satisfies Prisma.OrderSelect;

const ORDER_EXPORT_SELECT = {
  ...ORDER_DETAIL_SELECT,
  items: {
    include: {
      product: {
        select: {
          nameEn: true,
          nameZh: true,
        },
      },
      variant: {
        select: {
          weight: true,
        },
      },
    },
  },
} as const satisfies Prisma.OrderSelect;

// GET /api/admin/orders - Get paginated orders (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Get pagination parameters from query string
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const status = searchParams.get("status") || "all";
    const isExport = searchParams.get("export") === "true";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search")?.trim() || null;

    // Validate pagination parameters
    const validatedPage = Math.max(1, page);
    const validatedLimit = [10, 20].includes(limit) ? limit : 10;
    const skip = (validatedPage - 1) * validatedLimit;

    // Build where clause for filtering
    // Use AND array so search OR conditions compose with status + date-range AND filters
    const whereClause: any = {};
    const andConditions: any[] = [];

    if (status !== "all") {
      andConditions.push({ status });
    }
    if (startDate || endDate) {
      const dateFilter: any = {};
      if (startDate) {
        dateFilter.gte = new Date(`${startDate}T00:00:00.000Z`);
      }
      if (endDate) {
        dateFilter.lte = new Date(`${endDate}T23:59:59.999Z`);
      }
      andConditions.push({ orderedAt: dateFilter });
    }
    if (search) {
      andConditions.push({
        OR: [
          { id: { contains: search, mode: "insensitive" } },
          { orderNumber: { contains: search, mode: "insensitive" } },
          { deliveryAddress: { path: ["fullName"], string_contains: search } },
          { deliveryAddress: { path: ["name"], string_contains: search } },
          { deliveryAddress: { path: ["phone"], string_contains: search } },
          { items: { some: { product: { nameEn: { contains: search, mode: "insensitive" } } } } },
          { items: { some: { product: { nameZh: { contains: search, mode: "insensitive" } } } } },
        ],
      });
    }

    if (andConditions.length > 0) {
      whereClause.AND = andConditions;
    }

    // Export mode: return ALL matching orders (no pagination) with variant details
    if (isExport) {
      const allOrders = await prisma.order.findMany({
        where: whereClause,
        select: ORDER_EXPORT_SELECT,
        orderBy: {
          orderedAt: "desc",
        },
      });

      return NextResponse.json({ orders: allOrders });
    }

    // Get total count for pagination
    const totalCount = await prisma.order.count({
      where: whereClause,
    });

    // Get paginated orders
    const orders = await prisma.order.findMany({
      where: whereClause,
      select: ORDER_DETAIL_SELECT,
      orderBy: {
        orderedAt: "desc",
      },
      skip,
      take: validatedLimit,
    });

    // Get status counts for quick stats (unfiltered)
    const statusCounts = await prisma.order.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    });

    const stats = {
      pending: statusCounts.find(s => s.status === "pending")?._count.status || 0,
      confirmed: statusCounts.find(s => s.status === "confirmed")?._count.status || 0,
      shipped: statusCounts.find(s => s.status === "shipped")?._count.status || 0,
      delivered: statusCounts.find(s => s.status === "delivered")?._count.status || 0,
      total: await prisma.order.count(),
    };

    return NextResponse.json({
      orders,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        totalCount,
        totalPages: Math.ceil(totalCount / validatedLimit),
        hasNextPage: validatedPage < Math.ceil(totalCount / validatedLimit),
        hasPreviousPage: validatedPage > 1,
      },
      stats,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/orders - Update order status and payment status (admin only)
export async function PATCH(request: NextRequest) {
  try {
    // OPTIMIZATION: Use auth helper to avoid duplicate user query
    const authResult = await requireAdmin();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await request.json();
    const { orderId, orderStatus, paymentStatus } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Validate order status if provided
    const validOrderStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
    if (orderStatus && !validOrderStatuses.includes(orderStatus)) {
      return NextResponse.json(
        { error: "Invalid order status" },
        { status: 400 }
      );
    }

    // Validate payment status if provided
    const validPaymentStatuses = ["pending", "succeeded", "failed"];
    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return NextResponse.json(
        { error: "Invalid payment status" },
        { status: 400 }
      );
    }

    // Update order and payment status in a transaction
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Update order status
      if (orderStatus) {
        await tx.order.update({
          where: { id: orderId },
          data: { status: orderStatus },
        });
      }

      // Update payment status
      if (paymentStatus) {
        await tx.payment.updateMany({
          where: { orderId: orderId },
          data: {
            status: paymentStatus,
            ...(paymentStatus === "succeeded" && { paidAt: new Date() })
          },
        });
        
        // When payment is approved, also update order status to "confirmed" (if not already set)
        // This matches the behavior of approve-payment.ts script and Stripe webhook
        if (paymentStatus === "succeeded" && !orderStatus) {
          await tx.order.update({
            where: { id: orderId },
            data: { status: "confirmed" },
          });
        }

        // =============================================================
        // FPS PAYMENT APPROVAL - Handle stock reservation conversion
        // =============================================================
        // For FPS orders, stock was already reserved at checkout (type: 'reservation')
        // When approving, we convert reservations to sales - NO double-decrement
        // =============================================================
        if (paymentStatus === "succeeded") {
          const existingReservations = await tx.stockMovement.findMany({
            where: { 
              orderId: orderId, 
              type: "reservation" 
            },
          });

          if (existingReservations.length > 0) {
            // FPS order: Stock was already reserved - convert to sale
            console.log(`🔄 FPS Order Approval: Converting ${existingReservations.length} reservations to sales`);
            
            await tx.stockMovement.updateMany({
              where: { 
                orderId: orderId, 
                type: "reservation" 
              },
              data: { 
                type: "sale",
                reason: "FPS payment confirmed - reservation converted to sale",
              },
            });
            
            console.log(`✅ Stock reservations converted to sales for order ${orderId}`);
          } else {
            // Check if this is an Airwallex order that already has sales from webhook
            const existingSales = await tx.stockMovement.findMany({
              where: { 
                orderId: orderId, 
                type: "sale" 
              },
            });
            
            if (existingSales.length > 0) {
              console.log(`ℹ️ Order ${orderId} already has sales movements (likely processed by webhook)`);
            } else {
              // Edge case: No reservations and no sales - this shouldn't happen normally
              // but handle gracefully by logging a warning
              console.warn(`⚠️ Order ${orderId} has no stock movements - this may need manual review`);
            }
          }
        }
      }
    });

    // 🚢 AUTOMATIC SHIPANY ORDER CREATION - DISABLED (manually generating labels)
    // To re-enable, uncomment the block below
    /*
    if (paymentStatus === "succeeded") {
      try {
        const fullOrder = await prisma.order.findUnique({
          where: { id: orderId },
          include: {
            payment: true,
            user: true,
            items: {
              include: { product: true },
            },
          },
        });

        if (fullOrder) {
          const courierUid = (fullOrder as any).courier_uid;
          const existingShipanyOrderId = (fullOrder as any).shipany_order_id;

          console.log(`\n📦 Payment approved for order ${fullOrder.orderNumber}`);
          console.log(`   Courier UID: ${courierUid || "Not selected"}`);
          console.log(`   ShipAny Configured: ${shipanyClient.isConfigured()}`);
          console.log(`   Existing ShipAny Order: ${existingShipanyOrderId || "None"}`);

          if (courierUid && !existingShipanyOrderId) {
            if (!shipanyClient.isConfigured()) {
              console.log(`⚠️  WARNING: ShipAny is not configured!`);
            } else {
              try {
                console.log(`\n🚢 Creating ShipAny shipment for order ${fullOrder.orderNumber}...`);
                const shipmentInfo = await shipanyClient.createShipment(orderId);
                console.log(`\n✅ ShipAny Shipment Created Successfully!`);
              } catch (shipmentError) {
                console.error(`\n❌ Failed to create ShipAny shipment:`, shipmentError);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error during automatic ShipAny creation:", error);
      }
    }
    */

    // Fetch updated order
    const updatedOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: ORDER_DETAIL_SELECT,
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: "Order updated successfully"
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

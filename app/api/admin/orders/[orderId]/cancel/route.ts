export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import type { Prisma } from "@prisma/client";

/**
 * POST /api/admin/orders/[orderId]/cancel
 * Cancel an order and restore stock to inventory
 * 
 * This endpoint handles:
 * - FPS orders with 'reservation' type movements
 * - Confirmed orders with 'sale' type movements
 * - Updates order and payment status to 'cancelled'
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    // Verify admin access
    const authResult = await requireAdmin();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Parse optional cancellation reason from body
    let reason = "Order cancelled by admin";
    try {
      const body = await request.json();
      if (body.reason) {
        reason = body.reason;
      }
    } catch {
      // No body provided, use default reason
    }

    // Execute cancellation in a transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Fetch order with items and stock movements
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
          stockMovements: true,
          payment: true,
        },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      // Only allow cancellation of pending or confirmed orders
      const cancellableStatuses = ["pending", "confirmed"];
      if (!cancellableStatuses.includes(order.status)) {
        throw new Error(
          `Cannot cancel order in '${order.status}' status. Only pending or confirmed orders can be cancelled.`
        );
      }

      console.log(`\n❌ Cancelling order ${order.orderNumber}`);
      console.log(`   Current status: ${order.status}`);
      console.log(`   Stock movements: ${order.stockMovements.length}`);

      // Track restored stock for response
      const restoredItems: Array<{
        productId: string;
        productName: string;
        quantityRestored: number;
        previousStock: number;
        newStock: number;
      }> = [];

      // Restore stock for movements of type 'sale' or 'reservation'
      for (const movement of order.stockMovements) {
        if (movement.type === "sale" || movement.type === "reservation") {
          const product = await tx.product.findUnique({
            where: { id: movement.productId },
          });

          if (!product) {
            console.warn(`⚠️ Product ${movement.productId} not found - skipping stock restoration`);
            continue;
          }

          // Calculate quantity to restore (movements are negative for sales/reservations)
          const quantityToRestore = Math.abs(movement.quantity);
          const previousStock = product.stockQuantity;
          const newStock = previousStock + quantityToRestore;

          // Create cancellation movement (positive quantity = stock returned)
          await tx.stockMovement.create({
            data: {
              productId: movement.productId,
              type: "cancellation",
              quantity: quantityToRestore, // Positive = adding back to inventory
              previousStock,
              newStock,
              orderId: order.id,
              reason: reason,
              notes: `Restored from ${movement.type} movement`,
            },
          });

          // Update product stock
          await tx.product.update({
            where: { id: movement.productId },
            data: {
              stockQuantity: newStock,
              inStock: true, // Product is back in stock
            },
          });

          restoredItems.push({
            productId: product.id,
            productName: product.nameEn,
            quantityRestored: quantityToRestore,
            previousStock,
            newStock,
          });

          console.log(`   📦 Restored: ${product.nameEn} +${quantityToRestore} (${previousStock} → ${newStock})`);
        }
      }

      // Update order status to cancelled
      await tx.order.update({
        where: { id: orderId },
        data: { status: "cancelled" },
      });

      // Update payment status to cancelled
      if (order.payment) {
        await tx.payment.update({
          where: { id: order.payment.id },
          data: { status: "cancelled" },
        });
      }

      console.log(`✅ Order ${order.orderNumber} cancelled successfully`);

      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        previousStatus: order.status,
        newStatus: "cancelled",
        restoredItems,
        reason,
      };
    }, {
      timeout: 30000, // 30 second timeout for complex cancellations
    });

    return NextResponse.json({
      success: true,
      message: `Order ${result.orderNumber} cancelled successfully`,
      ...result,
    });

  } catch (error) {
    console.error("Error cancelling order:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Failed to cancel order";
    const statusCode = errorMessage.includes("not found") ? 404 
      : errorMessage.includes("Cannot cancel") ? 400 
      : 500;

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

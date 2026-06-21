export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createOrderSchema } from "@/lib/validation/checkout-schema";
import { requireMember, requireAuth } from "@/lib/auth-helpers";
import type { Prisma } from "@prisma/client";

// GET /api/orders — fetch user's orders
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: { include: { product: true } },
        payment: true,
      },
      orderBy: { orderedAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

// POST /api/orders — create new order (FPS manual payment only)
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireMember();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { user } = authResult;
    const body = await request.json();

    // Validate
    const validation = createOrderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid order data", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { items, subtotal, deliveryFee, total, deliveryMethod, deliveryAddress, paymentMethod, paymentReceiptUrl, preferredLanguage, customerNote } = validation.data;

    const orderNumber = `CN-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Validate stock
    const productIds = items.map(i => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, nameEn: true, stockQuantity: true, inStock: true, variants: true },
    });
    const productMap = new Map(products.map(p => [p.id, p]));

    // Build variant map
    const variantMap = new Map<string, any>();
    for (const p of products) {
      for (const v of p.variants) {
        variantMap.set(v.id, { ...v, productId: p.id });
      }
    }

    // Validate all items have stock
    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
      }
      if (item.variantId) {
        const variant = variantMap.get(item.variantId);
        if (!variant || variant.stockQuantity < item.quantity) {
          return NextResponse.json({ error: `Insufficient stock for ${product.nameEn}` }, { status: 400 });
        }
      } else if (product.stockQuantity < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${product.nameEn}` }, { status: 400 });
      }
    }

    // Create order with stock reservation (FPS — manual payment)
    const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          orderNumber,
          subtotal,
          deliveryFee,
          total,
          deliveryMethod,
          deliveryAddress: deliveryAddress as any,
          customerNote: customerNote || null,
          items: {
            create: items.map(item => ({
              productId: item.productId,
              variantId: item.variantId || null,
              quantity: item.quantity,
              unitPrice: 0, // Will be recalculated by webhook process
              totalPrice: 0,
            })),
          },
          payment: {
            create: {
              paymentMethod,
              amount: total,
              status: "pending",
              paymentReceiptUrl: paymentReceiptUrl || null,
              receiptUploadedAt: paymentReceiptUrl ? new Date() : null,
            },
          },
        },
        include: { items: { include: { product: true } }, payment: true },
      });

      // Reserve stock (atomic)
      for (const item of items) {
        if (item.variantId) {
          const variant = await tx.productVariant.findUnique({ where: { id: item.variantId }, select: { stockQuantity: true, weight: true } });
          if (variant) {
            const result = await tx.productVariant.updateMany({
              where: { id: item.variantId, stockQuantity: { gte: item.quantity } },
              data: { stockQuantity: { decrement: item.quantity } },
            });
            if (result.count === 0) throw new Error("Stock depleted by concurrent order");

            await tx.product.updateMany({
              where: { id: item.productId, stockQuantity: { gte: item.quantity } },
              data: { stockQuantity: { decrement: item.quantity } },
            });

            await tx.stockMovement.create({
              data: {
                productId: item.productId,
                variantId: item.variantId,
                type: "reservation",
                quantity: -item.quantity,
                previousStock: variant.stockQuantity,
                newStock: variant.stockQuantity - item.quantity,
                orderId: newOrder.id,
                performedBy: user.email,
                reason: "FPS payment — stock reserved",
              },
            });
          }
        } else {
          const product = await tx.product.findUnique({ where: { id: item.productId }, select: { stockQuantity: true } });
          if (product) {
            const result = await tx.product.updateMany({
              where: { id: item.productId, stockQuantity: { gte: item.quantity } },
              data: { stockQuantity: { decrement: item.quantity } },
            });
            if (result.count === 0) throw new Error("Stock depleted by concurrent order");

            await tx.stockMovement.create({
              data: {
                productId: item.productId,
                type: "reservation",
                quantity: -item.quantity,
                previousStock: product.stockQuantity,
                newStock: product.stockQuantity - item.quantity,
                orderId: newOrder.id,
                performedBy: user.email,
                reason: "FPS payment — stock reserved",
              },
            });
          }
        }
      }

      return newOrder;
    }, { maxWait: 20000, timeout: 20000 });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

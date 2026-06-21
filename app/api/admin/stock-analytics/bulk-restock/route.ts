export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RestockItem {
  productId: string;
  quantity: number;
}

// POST /api/admin/stock-analytics/bulk-restock - Bulk restock multiple products
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, name: true },
    });

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { items, notes }: { items: RestockItem[]; notes?: string } = body;

    // Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Items array is required" },
        { status: 400 }
      );
    }

    // Validate each item
    for (const item of items) {
      if (!item.productId || typeof item.quantity !== "number" || item.quantity <= 0) {
        return NextResponse.json(
          { error: "Each item must have a valid productId and positive quantity" },
          { status: 400 }
        );
      }
    }

    // Perform bulk restock in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedProducts = [];

      for (const item of items) {
        // Get current product
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { id: true, nameEn: true, nameZh: true, stockQuantity: true },
        });

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        const previousStock = product.stockQuantity;
        const newStockQuantity = previousStock + item.quantity;

        // Update product stock
        const updated = await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: newStockQuantity,
            inStock: newStockQuantity > 0,
          },
        });

        // Log stock movement
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: "restock",
            quantity: item.quantity,
            previousStock,
            newStock: newStockQuantity,
            notes: notes || "Bulk restock operation",
            performedBy: session.user.email,
          },
        });

        updatedProducts.push({
          productId: product.id,
          productName: product.nameEn,
          productNameZh: product.nameZh,
          previousStock,
          newStock: newStockQuantity,
          added: item.quantity,
        });

        console.log(
          `📦 Bulk restock: ${product.nameEn} +${item.quantity} (${previousStock} → ${newStockQuantity})`
        );
      }

      return updatedProducts;
    });

    console.log(
      `✅ Admin ${user.name} performed bulk restock on ${items.length} products`
    );

    return NextResponse.json({
      success: true,
      message: `Successfully restocked ${items.length} products`,
      updatedProducts: result,
      performedBy: user.name,
    });
  } catch (error) {
    console.error("Error in bulk restock:", error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to perform bulk restock" },
      { status: 500 }
    );
  }
}

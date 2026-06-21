export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// POST /api/admin/products/[id]/restock - Admin restock product
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      select: { role: true, name: true },
    });

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { quantity, operation, variantId } = body;

    // Validate input
    if (!quantity || typeof quantity !== "number" || quantity < 0) {
      return NextResponse.json(
        { error: "Valid quantity is required" },
        { status: 400 }
      );
    }

    if (!operation || !["add", "set"].includes(operation)) {
      return NextResponse.json(
        { error: "Operation must be 'add' or 'set'" },
        { status: 400 }
      );
    }

    if (!variantId) {
      return NextResponse.json(
        { error: "Variant ID is required" },
        { status: 400 }
      );
    }

    // Get current product and variant
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      select: { id: true, nameEn: true, nameZh: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { id: true, weight: true, stockQuantity: true, productId: true },
    });

    if (!variant) {
      return NextResponse.json(
        { error: "Variant not found" },
        { status: 404 }
      );
    }

    if (variant.productId !== params.id) {
      return NextResponse.json(
        { error: "Variant does not belong to this product" },
        { status: 400 }
      );
    }

    // Calculate new stock quantity and actual change
    let newStockQuantity: number;
    let actualChange: number;
    
    if (operation === "add") {
      newStockQuantity = variant.stockQuantity + quantity;
      actualChange = quantity;
    } else {
      // operation === "set"
      newStockQuantity = quantity;
      actualChange = quantity - variant.stockQuantity;
    }

    // Update variant stock and log movement in a transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Update VARIANT stock (not product stock)
      const updatedVariant = await tx.productVariant.update({
        where: { id: variantId },
        data: {
          stockQuantity: newStockQuantity,
        },
      });

      // Also update product-level stock for backward compatibility
      // Calculate total stock from all variants
      const allVariants = await tx.productVariant.findMany({
        where: { productId: params.id },
        select: { stockQuantity: true },
      });
      const totalStock = allVariants.reduce((sum: number, v: { stockQuantity: number }) => sum + v.stockQuantity, 0);
      
      await tx.product.update({
        where: { id: params.id },
        data: {
          stockQuantity: totalStock,
          inStock: totalStock > 0,
        },
      });

      // Log stock movement with variantId
      await tx.stockMovement.create({
        data: {
          productId: params.id,
          variantId: variantId,  // Using the EXACT variantId from request payload
          type: "restock",
          quantity: actualChange,
          previousStock: variant.stockQuantity,
          newStock: newStockQuantity,
          notes: `${operation === "add" ? "Added" : "Set to"} ${quantity} units (${variant.weight})`,
          performedBy: session.user.email,
        },
      });

      return updatedVariant;
    });

    console.log(
      `✅ Admin ${user.name} restocked ${product.nameEn} - ${variant.weight}: ${operation === "add" ? `+${quantity}` : quantity} (${variant.stockQuantity} → ${newStockQuantity})`
    );

    // Revalidate cache so customers see fresh stock immediately
    revalidatePath(`/product/${params.id}`);
    revalidatePath('/');

    return NextResponse.json({
      success: true,
      variant: result,
      message: `Stock updated successfully for ${variant.weight}. New quantity: ${newStockQuantity}`,
      operation: {
        type: operation,
        amount: quantity,
        previousStock: variant.stockQuantity,
        newStock: newStockQuantity,
        variant: variant.weight,
        admin: user.name,
      },
    });
  } catch (error) {
    console.error("Error restocking product:", error);
    return NextResponse.json(
      { error: "Failed to restock product" },
      { status: 500 }
    );
  }
}

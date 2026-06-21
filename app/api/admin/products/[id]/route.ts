export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { productUpdateSchema } from "@/lib/validation/product-schema";
import { Prisma } from "@prisma/client";

// PUT /api/admin/products/[id] - Update product (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and authorize admin
    const authResult = await requireAdmin();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await request.json();

    // Validate input data
    const validation = productUpdateSchema.safeParse({ ...body, id: params.id });
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        variants: true
      }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    
    if (data.nameEn !== undefined) updateData.nameEn = data.nameEn;
    if (data.nameZh !== undefined) updateData.nameZh = data.nameZh;
    if (data.priceHkd !== undefined) updateData.priceHkd = data.priceHkd;
    if (data.platinumPriceHkd !== undefined) updateData.platinumPriceHkd = data.platinumPriceHkd || null;  // VIP Tier: Platinum pricing
    if (data.grade !== undefined) updateData.grade = data.grade;
    if (data.weight !== undefined) updateData.weight = data.weight;
    if (data.shippingWeightKg !== undefined) {
      updateData.shippingWeightKg = new Prisma.Decimal(data.shippingWeightKg);
    }
    if (data.packageLengthCm !== undefined) updateData.packageLengthCm = data.packageLengthCm;
    if (data.packageWidthCm !== undefined) updateData.packageWidthCm = data.packageWidthCm;
    if (data.packageHeightCm !== undefined) updateData.packageHeightCm = data.packageHeightCm;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.descriptionEn !== undefined) updateData.descriptionEn = data.descriptionEn;
    if (data.descriptionZh !== undefined) updateData.descriptionZh = data.descriptionZh;
    if (data.origin !== undefined) updateData.origin = data.origin;
    if (data.originZh !== undefined) updateData.originZh = data.originZh;
    if (data.preparationTipsEn !== undefined) updateData.preparationTipsEn = data.preparationTipsEn;
    if (data.preparationTipsZh !== undefined) updateData.preparationTipsZh = data.preparationTipsZh;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.categoryZh !== undefined) updateData.categoryZh = data.categoryZh;
    if (data.stockQuantity !== undefined) {
      updateData.stockQuantity = data.stockQuantity;
      updateData.inStock = data.stockQuantity > 0;
    }
    if (data.featured !== undefined) updateData.featured = data.featured;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    // Handle variants update with upsert approach
    let variantOperations: any[] = [];
    
    if (data.variants && data.variants.length > 0) {
      // Get IDs of variants being sent from frontend
      const incomingVariantIds = data.variants
        .filter(v => v.id && v.id.trim() !== '')
        .map(v => v.id as string);
      
      // Find variants to delete (existing variants not in incoming list)
      // IMPORTANT: Only delete if not referenced by OrderItems
      const variantsToCheck = existingProduct.variants.filter(
        v => !incomingVariantIds.includes(v.id)
      );
      
      for (const variantToDelete of variantsToCheck) {
        // Check if variant has associated order items
        const orderItemCount = await prisma.orderItem.count({
          where: { variantId: variantToDelete.id }
        });
        
        if (orderItemCount === 0) {
          // Safe to delete - no foreign key constraints
          variantOperations.push(
            prisma.productVariant.delete({
              where: { id: variantToDelete.id }
            })
          );
        } else {
          // Don't delete - has order history
          console.warn(`⚠️ Cannot delete variant ${variantToDelete.id} - has ${orderItemCount} order items`);
        }
      }
      
      // Upsert (update or create) each variant
      for (const variant of data.variants) {
        const variantData = {
          weight: variant.weight,
          weightGrams: variant.weightGrams,
          priceHkd: variant.priceHkd,
          platinumPriceHkd: variant.platinumPriceHkd || null,
          stockQuantity: variant.stockQuantity,
          isActive: variant.isActive !== undefined ? variant.isActive : true,
          isDefault: variant.isDefault,
          sortOrder: variant.sortOrder,
          shippingWeightKg: new Prisma.Decimal(variant.shippingWeightKg),
          packageLengthCm: variant.packageLengthCm,
          packageWidthCm: variant.packageWidthCm,
          packageHeightCm: variant.packageHeightCm,
        };
        
        if (variant.id && variant.id.trim() !== '') {
          // Update existing variant
          variantOperations.push(
            prisma.productVariant.update({
              where: { id: variant.id },
              data: variantData,
            })
          );
        } else {
          // Create new variant
          variantOperations.push(
            prisma.productVariant.create({
              data: {
                ...variantData,
                productId: params.id,
              },
            })
          );
        }
      }
    }

    // Execute all operations in a transaction
    const [product, ...updatedVariants] = await prisma.$transaction([
      prisma.product.update({
        where: { id: params.id },
        data: updateData,
      }),
      ...variantOperations,
    ]);
    
    // Fetch the complete updated product with variants
    const completeProduct = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        variants: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    console.log(`✅ Admin ${authResult.user.email} updated product: ${product.nameEn} (${product.id}) with ${data.variants?.length || 0} variants`);

    // Revalidate caches to ensure changes are reflected immediately
    revalidatePath('/product/' + params.id);
    revalidatePath('/admin/products');
    revalidatePath('/');

    return NextResponse.json(
      { 
        success: true, 
        product: completeProduct,
        message: "Product updated successfully"
      }
    );
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/products/[id] - Update product (admin only)
// Alias for PUT method - both use the same logic
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return PUT(request, { params });
}

// DELETE /api/admin/products/[id] - Delete product (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and authorize admin
    const authResult = await requireAdmin();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
      select: { 
        id: true, 
        nameEn: true,
        _count: {
          select: {
            orderItems: true,
          }
        }
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if product has order history
    if (existingProduct._count.orderItems > 0) {
      // Soft delete - mark as out of stock and set quantity to 0
      const product = await prisma.product.update({
        where: { id: params.id },
        data: {
          inStock: false,
          stockQuantity: 0,
        },
      });

      console.log(`⚠️ Admin ${authResult.user.email} soft-deleted product: ${existingProduct.nameEn} (${existingProduct.id}) - has order history`);

      return NextResponse.json(
        { 
          success: true, 
          product,
          message: "Product marked as out of stock (has order history)",
          softDelete: true
        }
      );
    } else {
      // Hard delete - no order history
      await prisma.product.delete({
        where: { id: params.id },
      });

      console.log(`🗑️ Admin ${authResult.user.email} hard-deleted product: ${existingProduct.nameEn} (${existingProduct.id})`);

      return NextResponse.json(
        { 
          success: true,
          message: "Product deleted permanently",
          softDelete: false
        }
      );
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}

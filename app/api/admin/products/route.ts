export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { productSchema } from "@/lib/validation/product-schema";
import { Prisma } from "@prisma/client";

// GET /api/admin/products - Get all products including out of stock (admin only)
export async function GET(request: NextRequest) {
  try {
    // OPTIMIZATION: Use auth helper to avoid duplicate user query
    const authResult = await requireAdmin();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    // Get ALL products regardless of stock status for admin
    const products = await prisma.product.findMany({
      include: {
        variants: {
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/admin/products - Create new product (admin only)
export async function POST(request: NextRequest) {
  try {
    // Authenticate and authorize admin
    const authResult = await requireAdmin();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await request.json();

    // 🔍 DIAGNOSTIC: Log received payload
    console.log("📥 API received payload keys:", Object.keys(body));
    console.log("📦 Has variants field:", 'variants' in body);
    if ('variants' in body) {
      console.log("📊 Variants count:", body.variants?.length);
    }

    // Validate input data
    const validation = productSchema.safeParse(body);
    if (!validation.success) {
      // 🔍 DIAGNOSTIC: Log validation errors in detail
      console.error("❌ Validation failed for product creation:");
      console.error("📋 Validation errors:", JSON.stringify(validation.error.errors, null, 2));
      console.error("🔑 Failed fields:", validation.error.errors.map(e => e.path.join('.')));
      
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.errors
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if product ID already exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: data.id },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: "Product with this ID already exists" },
        { status: 409 }
      );
    }

    // When using variants, use default variant's price/weight for product-level fields
    const defaultVariant = data.variants?.find(v => v.isDefault) || data.variants?.[0];
    const productPrice = data.priceHkd ?? defaultVariant?.priceHkd ?? 0;
    const productWeight = data.weight ?? defaultVariant?.weight ?? '500g';
    
    // Calculate total stock from variants (if provided)
    const totalStock = data.variants && data.variants.length > 0 
      ? data.variants.reduce((sum, v) => sum + v.stockQuantity, 0)
      : data.stockQuantity;
    const hasStock = totalStock > 0;

    // Create product with variants in a transaction
    const product = await prisma.product.create({
      data: {
        id: data.id,
        nameEn: data.nameEn,
        nameZh: data.nameZh,
        priceHkd: productPrice,
        platinumPriceHkd: data.platinumPriceHkd || null,
        grade: data.grade,
        weight: productWeight,
        imageUrl: data.imageUrl,
        descriptionEn: data.descriptionEn,
        descriptionZh: data.descriptionZh,
        origin: data.origin,
        originZh: data.originZh,
        category: data.category,
        categoryZh: data.categoryZh,
        stockQuantity: totalStock,
        inStock: hasStock,
        featured: data.featured,
        // Create variants if provided
        variants: data.variants && data.variants.length > 0 ? {
          create: data.variants.map(variant => ({
            weight: variant.weight,
            weightGrams: variant.weightGrams,
            priceHkd: variant.priceHkd,
            platinumPriceHkd: variant.platinumPriceHkd || null,
            stockQuantity: variant.stockQuantity,
            isDefault: variant.isDefault,
            sortOrder: variant.sortOrder,
            shippingWeightKg: new Prisma.Decimal(variant.shippingWeightKg),
            packageLengthCm: variant.packageLengthCm,
            packageWidthCm: variant.packageWidthCm,
            packageHeightCm: variant.packageHeightCm,
          }))
        } : undefined
      },
      include: {
        variants: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    console.log(`✅ Admin ${authResult.user.email} created product: ${product.nameEn} (${product.id}) with ${data.variants?.length || 0} variants`);

    return NextResponse.json(
      {
        success: true,
        product,
        message: "Product created successfully"
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

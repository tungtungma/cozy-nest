export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek, addDays, format } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

// GET /api/admin/stock-analytics/weekly - Get weekly stock analytics
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get date range for this week
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // Sunday

    // Get all product variants (count individual variants, not base products)
    const totalProducts = await prisma.productVariant.count();

    // Get low stock variants (<=10) with product details
    const lowStockVariants = await prisma.productVariant.findMany({
      where: {
        stockQuantity: { lte: 10 },
      },
      include: {
        product: {
          select: {
            nameEn: true,
            nameZh: true,
          },
        },
      },
      orderBy: {
        stockQuantity: "asc",
      },
    });

    // Transform to include variant weight in the name
    const lowStockProducts = lowStockVariants.map((variant: typeof lowStockVariants[0]) => ({
      id: variant.id,
      nameEn: `${variant.product.nameEn} - ${variant.weight}`,
      nameZh: `${variant.product.nameZh} - ${variant.weight}`,
      stockQuantity: variant.stockQuantity,
      priceHkd: variant.priceHkd,
    }));

    // Get stock movements for this week with order items to get variant info
    const weekMovements = await prisma.stockMovement.findMany({
      where: {
        createdAt: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
      include: {
        product: {
          select: {
            id: true,
            nameEn: true,
            nameZh: true,
            priceHkd: true,
            variants: {
              select: {
                id: true,
                weight: true,
                priceHkd: true,
                stockQuantity: true,
                isDefault: true,
              },
            },
          },
        },
        order: {
          select: {
            items: {
              select: {
                productId: true,
                variantId: true,
                variantWeight: true,
                variant: {
                  select: {
                    id: true,
                    weight: true,
                    priceHkd: true,
                    stockQuantity: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Helper function to get the correct variant for a stock movement
    const getVariantForMovement = (movement: typeof weekMovements[0]) => {
      const productId = movement.productId;
      
      console.log(`\n[VARIANT MAPPING] Movement ${movement.id} (${movement.product.nameEn}):`);
      console.log(`  Step 1: Checking for order items with variantId...`);
      
      // Try to get variant from order items using variantId
      if (movement.order?.items) {
        console.log(`  - Order has ${movement.order.items.length} items`);
        const orderItem = movement.order.items.find(
          (item: typeof movement.order.items[0]) => item.productId === productId && item.variantId
        );
        
        if (orderItem) {
          console.log(`  - Found matching order item: productId=${orderItem.productId}, variantId=${orderItem.variantId}`);
          if (orderItem.variant) {
            console.log(`  ✅ SUCCESS: Using variant from order item - ${orderItem.variant.weight} (ID: ${orderItem.variant.id})`);
            return orderItem.variant;
          } else {
            console.log(`  ⚠️ Order item has variantId but variant relation is NULL`);
          }
        } else {
          console.log(`  - No order item found with productId=${productId} AND variantId`);
          movement.order.items.forEach((item: any, idx: number) => {
            console.log(`    Item ${idx}: productId=${item.productId}, variantId=${item.variantId || 'NULL'}, variantWeight=${item.variantWeight || 'NULL'}`);
          });
        }
      } else {
        console.log(`  - No order or order.items (movement type: ${movement.type})`);
      }
      
      // STRICT HISTORICAL MAPPING: For legacy records without variantId
      console.log(`  Step 2: Falling back to default variant...`);
      console.log(`  - Product has ${movement.product.variants.length} variants`);
      movement.product.variants.forEach((v: any, idx: number) => {
        console.log(`    Variant ${idx}: ${v.weight}, isDefault=${v.isDefault}, stock=${v.stockQuantity}, id=${v.id}`);
      });
      
      // 1. First try to find the variant where isDefault === true
      const defaultVariant = movement.product.variants.find(
        (v: typeof movement.product.variants[0]) => v.isDefault === true
      );
      if (defaultVariant) {
        console.log(`  ✅ SUCCESS: Using default variant (isDefault=true) - ${defaultVariant.weight} (ID: ${defaultVariant.id})`);
        return defaultVariant;
      } else {
        console.log(`  ⚠️ No variant with isDefault=true found!`);
      }
      
      // 2. If no default, fallback to the variant where weight === '500g' (legacy products)
      console.log(`  Step 3: Falling back to 500g variant...`);
      const legacy500gVariant = movement.product.variants.find(
        (v: typeof movement.product.variants[0]) => v.weight === '500g'
      );
      if (legacy500gVariant) {
        console.log(`  ✅ SUCCESS: Using 500g fallback variant - ${legacy500gVariant.weight} (ID: ${legacy500gVariant.id})`);
        return legacy500gVariant;
      } else {
        console.log(`  ⚠️ No 500g variant found!`);
      }
      
      // 3. Last resort: use first variant (should rarely happen)
      console.log(`  Step 4: Last resort - using first variant...`);
      const firstVariant = movement.product.variants[0] || null;
      if (firstVariant) {
        console.log(`  ⚠️ WARNING: Using first variant as last resort - ${firstVariant.weight} (ID: ${firstVariant.id})`);
      } else {
        console.log(`  ❌ ERROR: No variants found for product ${productId}!`);
      }
      return firstVariant;
    };

    // Calculate weekly stats
    const soldThisWeek = weekMovements
      .filter((m: typeof weekMovements[0]) => m.type === "sale")
      .reduce((sum: number, m: typeof weekMovements[0]) => sum + Math.abs(m.quantity), 0);

    const restockedThisWeek = weekMovements
      .filter((m: typeof weekMovements[0]) => m.type === "restock")
      .reduce((sum: number, m: typeof weekMovements[0]) => sum + m.quantity, 0);

    // Group movements by day for chart (with Hong Kong timezone)
    const HONG_KONG_TZ = "Asia/Hong_Kong";
    const dailyMovements = Array.from({ length: 7 }, (_, i) => {
      const day = addDays(weekStart, i); // Monday (i=0) through Sunday (i=6)
      const dayName = format(day, "EEE"); // Mon, Tue, Wed, etc.

      // Build day boundaries correctly regardless of server timezone:
      // 1. Create a Date whose local components are midnight in HKT
      // 2. Convert from HKT to UTC using fromZonedTime
      const dayStartLocal = new Date(
        day.getFullYear(),
        day.getMonth(),
        day.getDate(),
        0, 0, 0
      );
      const dayStart = fromZonedTime(dayStartLocal, HONG_KONG_TZ);

      const dayEndLocal = new Date(
        day.getFullYear(),
        day.getMonth(),
        day.getDate(),
        23, 59, 59, 999
      );
      const dayEnd = fromZonedTime(dayEndLocal, HONG_KONG_TZ);

      const dayData = weekMovements.filter((m: typeof weekMovements[0]) => {
        const movementDate = m.createdAt;
        return movementDate >= dayStart && movementDate <= dayEnd;
      });

      const sales = dayData
        .filter((m: typeof weekMovements[0]) => m.type === "sale")
        .reduce((sum: number, m: typeof weekMovements[0]) => sum + Math.abs(m.quantity), 0);

      const restocks = dayData
        .filter((m: typeof weekMovements[0]) => m.type === "restock")
        .reduce((sum: number, m: typeof weekMovements[0]) => sum + m.quantity, 0);

      return {
        day: dayName,
        sales,
        restocks,
      };
    });

    // Calculate product performance (sales by product + variant)
    const productSales: {
      [key: string]: { productEn: string; productZh: string; sold: number; revenue: number };
    } = {};

    weekMovements
      .filter((m: typeof weekMovements[0]) => m.type === "sale")
      .forEach((movement: typeof weekMovements[0]) => {
        const variant = getVariantForMovement(movement);
        
        // Handle both modern variants and legacy products
        let variantWeight: string;
        let actualPrice: number;
        let displayNameEn: string;
        let displayNameZh: string;
        let key: string;
        
        if (variant) {
          // Modern product with variants
          variantWeight = variant.weight;
          actualPrice = variant.priceHkd;
          key = `${movement.productId}-${variantWeight}`;
          displayNameEn = `${movement.product.nameEn} - ${variantWeight}`;
          displayNameZh = `${movement.product.nameZh} - ${variantWeight}`;
        } else {
          // Legacy product without variants - use base product info
          variantWeight = "legacy";
          actualPrice = movement.product.priceHkd;
          key = `${movement.productId}-legacy`;
          displayNameEn = movement.product.nameEn;
          displayNameZh = movement.product.nameZh;
        }
        
        if (!productSales[key]) {
          productSales[key] = {
            productEn: displayNameEn,
            productZh: displayNameZh,
            sold: 0,
            revenue: 0,
          };
        }
        const quantity = Math.abs(movement.quantity);
        productSales[key].sold += quantity;
        productSales[key].revenue += quantity * actualPrice;
      });

    const productPerformance = Object.values(productSales).sort((a, b) => b.sold - a.sold);

    // Format recent movements for table with variant information
    // STRICT LIVE STOCK: Fetch current stock directly from ProductVariant table
    const recentMovements = await Promise.all(
      weekMovements.slice(0, 30).map(async (movement: typeof weekMovements[0]) => {
        const variant = getVariantForMovement(movement);
        
        // 🔍 DIAGNOSTIC LOGGING: Track variant lookup results
        console.log(`\n[STOCK DIAGNOSTIC] Movement ${movement.id}:`);
        console.log(`  - Product: ${movement.product.nameEn}`);
        console.log(`  - Movement Type: ${movement.type}`);
        console.log(`  - Has Order: ${!!movement.order}`);
        console.log(`  - Order Items Count: ${movement.order?.items?.length || 0}`);
        console.log(`  - Variant Found: ${!!variant}`);
        console.log(`  - Variant ID: ${variant?.id || 'NULL'}`);
        console.log(`  - Variant Weight: ${variant?.weight || 'NULL'}`);
        console.log(`  - Product Variants Available: ${movement.product.variants.length}`);
        console.log(`  - Product Variants: ${movement.product.variants.map((v: typeof movement.product.variants[0]) => `${v.weight}(default:${v.isDefault})`).join(', ')}`);
        
        const variantWeight = variant?.weight || "";
        
        // CRITICAL: Fetch live stock quantity directly from the database
        // Do NOT use variant.stockQuantity from the movement query as it may be stale
        let currentStock = 0;
        if (variant?.id) {
          console.log(`  - 🔍 Fetching live stock for variant ${variant.id}...`);
          const liveVariant = await prisma.productVariant.findUnique({
            where: { id: variant.id },
            select: { stockQuantity: true },
          });
          currentStock = liveVariant?.stockQuantity ?? 0;
          console.log(`  - ✅ Live Stock Retrieved from VARIANT: ${currentStock}`);
        } else {
          console.log(`  - ⚠️ No variant found - checking legacy Product table...`);
          // FALLBACK: For legacy products without variants, read from deprecated Product.stockQuantity
          const liveProduct = await prisma.product.findUnique({
            where: { id: movement.productId },
            select: { stockQuantity: true },
          });
          currentStock = liveProduct?.stockQuantity ?? 0;
          console.log(`  - ✅ Live Stock Retrieved from LEGACY PRODUCT TABLE: ${currentStock}`);
        }
        
        const displayNameEn = variantWeight
          ? `${movement.product.nameEn} - ${variantWeight}`
          : movement.product.nameEn;
        
        const displayNameZh = variantWeight
          ? `${movement.product.nameZh} - ${variantWeight}`
          : movement.product.nameZh;
        
        return {
          id: movement.id,
          productName: displayNameEn,
          productNameZh: displayNameZh,
          type: movement.type,
          quantity: movement.quantity,
          // STRICT: Use live stockQuantity from ProductVariant table
          previousStock: currentStock, // Show current stock (historical previousStock not available)
          newStock: currentStock,      // Show current stock (historical newStock not available)
          currentStock: currentStock,  // Live stock from database
          orderId: movement.orderId,
          notes: movement.notes,
          performedBy: movement.performedBy,
          createdAt: movement.createdAt.toISOString(),
        };
      })
    );

    return NextResponse.json({
      weekStats: {
        totalProducts,
        soldThisWeek,
        restockedThisWeek,
        lowStockCount: lowStockProducts.length,
      },
      lowStockProducts,
      dailyMovements,
      productPerformance,
      recentMovements,
    });
  } catch (error) {
    console.error("Error fetching weekly stock analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock analytics" },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/products - Get all products or filter by category
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const includeInactive = searchParams.get("includeInactive") === "true"; // Admin view

    const products = await prisma.product.findMany({
      where: {
        ...(category && { category }),
        ...(featured === "true" && { featured: true }),
        inStock: true,
        // Filter out inactive products unless specifically requested (admin view)
        ...(!includeInactive && { isActive: true }),
      },
      include: {
        variants: {
          where: {
            // Filter out inactive variants unless specifically requested (admin view)
            ...(!includeInactive && { isActive: true }),
          },
          orderBy: {
            sortOrder: 'asc'
          }
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

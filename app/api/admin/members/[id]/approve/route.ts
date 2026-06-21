export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/admin/members/[id]/approve - Approve a member (admin only)
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
    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, name: true },
    });

    if (!admin || admin.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Get the user to approve
    const userToApprove = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!userToApprove) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Allow approval for pending or cancelled users
    if (userToApprove.role !== "pending" && userToApprove.role !== "cancelled") {
      return NextResponse.json(
        { error: "User is already an active member or admin" },
        { status: 400 }
      );
    }

    // Approve or reactivate the user
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        role: "member",
        approvedAt: new Date(),
        approvedBy: admin.id,
      },
    });

    const action = userToApprove.role === "cancelled" ? "reactivated" : "approved";
    console.log(
      `✅ Admin ${admin.name} ${action} member: ${userToApprove.email}`
    );

    const message = userToApprove.role === "cancelled"
      ? `Member ${userToApprove.email} reactivated successfully`
      : `Member ${userToApprove.email} approved successfully`;

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message,
    });
  } catch (error) {
    console.error("Error approving member:", error);
    return NextResponse.json(
      { error: "Failed to approve member" },
      { status: 500 }
    );
  }
}

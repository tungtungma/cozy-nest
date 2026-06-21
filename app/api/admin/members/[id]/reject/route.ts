export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/admin/members/[id]/reject - Delete a user (reject pending/cancel membership/revoke access) (admin only)
export async function DELETE(
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

    // Get the user to delete
    const userToDelete = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!userToDelete) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Prevent admins from deleting themselves
    if (userToDelete.id === admin.id) {
      return NextResponse.json(
        { error: "Cannot delete your own admin account" },
        { status: 400 }
      );
    }

    // For pending users: Delete them completely (no orders yet)
    // For active users: Set role to "cancelled" to preserve order history
    if (userToDelete.role === "pending") {
      // Delete pending user completely
      await prisma.user.delete({
        where: { id: params.id },
      });

      console.log(
        `❌ Admin ${admin.name} rejected pending member: ${userToDelete.email}`
      );

      return NextResponse.json({
        success: true,
        message: `Pending member ${userToDelete.email} rejected and removed`,
      });
    } else {
      // For active members/admins: Change role to "cancelled" to preserve history
      await prisma.user.update({
        where: { id: params.id },
        data: { role: "cancelled" },
      });

      const action =
        userToDelete.role === "admin" ? "revoked admin access for" :
        "canceled membership for";
      
      console.log(
        `❌ Admin ${admin.name} ${action}: ${userToDelete.email}`
      );

      const message =
        userToDelete.role === "admin" ? `Admin access revoked for ${userToDelete.email}. User account set to cancelled.` :
        `Membership canceled for ${userToDelete.email}. Order history preserved.`;

      return NextResponse.json({
        success: true,
        message,
      });
    }
  } catch (error) {
    console.error("Error deleting member:", error);
    return NextResponse.json(
      { error: "Failed to delete member" },
      { status: 500 }
    );
  }
}

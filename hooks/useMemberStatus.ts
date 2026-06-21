"use client";

import { useSession } from "next-auth/react";

export function useMemberStatus() {
  const { data: session, status } = useSession();

  return {
    isLoading: status === "loading",
    isGuest: !session || !session.user,
    isAuthenticated: !!session && !!session.user,
    isPending: session?.user?.role === "pending",
    isMember: session?.user?.role === "member",
    isAdmin: session?.user?.role === "admin",
    canSeePrice: session?.user?.role === "member" || session?.user?.role === "admin",
    canPurchase: session?.user?.role === "member" || session?.user?.role === "admin",
    canAccessCheckout: session?.user?.role === "member" || session?.user?.role === "admin",
    user: session?.user,
    role: session?.user?.role || "guest",
    approvedAt: session?.user?.approvedAt,
  };
}

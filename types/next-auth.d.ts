import { DefaultSession } from "next-auth";
import { VIPTier } from "./vip-tier";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string;
      approvedAt?: Date | null;
      // VIP Tier fields
      tier?: VIPTier | string;
      tierAchievedAt?: Date | null;
      currentCycleSpend?: number | string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    approvedAt?: Date | null;
    // VIP Tier fields
    tier?: VIPTier | string;
    tierAchievedAt?: Date | null;
    currentCycleSpend?: number | any;
    lifetimeSpend?: number | any;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    tier?: VIPTier | string;
  }
}

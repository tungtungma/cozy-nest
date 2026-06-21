/**
 * VIP Tier System Configuration
 * 
 * Updated Tier Thresholds (per user requirements):
 * - Member: HKD 0 - 4,999
 * - Silver: HKD 5,000 - 9,999 (Auto-upgrade)
 * - Gold: HKD 10,000 - 14,999 (Auto-upgrade, gets 5% cart discount)
 * - Platinum: HKD 15,000+ (Manual admin upgrade only, gets platinum pricing)
 */

export type VIPTier = 'member' | 'silver' | 'gold' | 'platinum';

export interface TierConfig {
  name: VIPTier;
  minSpend: number;      // Minimum spend to achieve (HKD)
  maxSpend: number | null;  // Maximum spend before next tier (null = unlimited)
  discount: number;      // Percentage discount (0-100)
  autoUpgrade: boolean;  // Whether tier is auto-achieved on spend
  displayName: {
    en: string;
    zh: string;
  };
  color: string;         // Badge color
  icon: string;          // Icon/emoji for UI
}

// IMPORTANT: These thresholds are easily configurable constants
// To adjust tier boundaries, modify these values
export const TIER_THRESHOLDS = {
  SILVER_MIN: 5000,
  GOLD_MIN: 10000,
  PLATINUM_MIN: 15000,
} as const;

export const TIER_CONFIGS: Record<VIPTier, TierConfig> = {
  member: {
    name: 'member',
    minSpend: 0,
    maxSpend: TIER_THRESHOLDS.SILVER_MIN - 1, // 4,999
    discount: 0,
    autoUpgrade: true,
    displayName: { en: 'Member', zh: '會員' },
    color: 'gray',
    icon: '👤',
  },
  silver: {
    name: 'silver',
    minSpend: TIER_THRESHOLDS.SILVER_MIN, // 5,000
    maxSpend: TIER_THRESHOLDS.GOLD_MIN - 1, // 9,999
    discount: 0,
    autoUpgrade: true,
    displayName: { en: 'Silver', zh: '銀卡' },
    color: 'silver',
    icon: '🥈',
  },
  gold: {
    name: 'gold',
    minSpend: TIER_THRESHOLDS.GOLD_MIN, // 10,000
    maxSpend: TIER_THRESHOLDS.PLATINUM_MIN - 1, // 14,999
    discount: 5, // 5% cart discount
    autoUpgrade: true,
    displayName: { en: 'Gold', zh: '金卡' },
    color: 'amber',
    icon: '🥇',
  },
  platinum: {
    name: 'platinum',
    minSpend: TIER_THRESHOLDS.PLATINUM_MIN, // 15,000+
    maxSpend: null,  // No upper limit
    discount: 0,  // Uses product-specific platinum_price instead
    autoUpgrade: false,  // Manual admin upgrade only
    displayName: { en: 'Platinum', zh: '白金卡' },
    color: 'purple',
    icon: '💎',
  },
};

/**
 * Calculate tier based on spend amount (excludes Platinum - manual only)
 * @param spend - Total spend in HKD
 * @returns Calculated tier (never returns 'platinum' - that's manual only)
 */
export function calculateTierFromSpend(spend: number): VIPTier {
  // Platinum is manual only, so max auto-tier is Gold
  if (spend >= TIER_THRESHOLDS.GOLD_MIN) {
    return 'gold';
  }
  if (spend >= TIER_THRESHOLDS.SILVER_MIN) {
    return 'silver';
  }
  return 'member';
}

/**
 * Check if 1-year cycle has expired
 * @param tierAchievedAt - Date when tier was achieved
 * @returns true if >= 1 year has passed
 */
export function isResetDue(tierAchievedAt: Date | null): boolean {
  if (!tierAchievedAt) return false;
  
  const oneYearLater = new Date(tierAchievedAt);
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
  
  return new Date() >= oneYearLater;
}

/**
 * Get the reset date (1 year after tier achieved)
 * @param tierAchievedAt - Date when tier was achieved
 * @returns Date when tier will reset, or null if no tier achievement date
 */
export function getResetDate(tierAchievedAt: Date | null): Date | null {
  if (!tierAchievedAt) return null;
  
  const resetDate = new Date(tierAchievedAt);
  resetDate.setFullYear(resetDate.getFullYear() + 1);
  
  return resetDate;
}

/**
 * Format reset date for display
 * @param tierAchievedAt - Date when tier was achieved
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted date string or empty string
 */
export function formatResetDate(tierAchievedAt: Date | string | null, locale: string = 'en-US'): string {
  if (!tierAchievedAt) return '';
  
  const resetDate = getResetDate(new Date(tierAchievedAt));
  if (!resetDate) return '';
  
  return resetDate.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Calculate discount amount for a tier
 * @param tier - User's VIP tier
 * @param subtotal - Order subtotal in HKD
 * @returns Discount amount in HKD
 */
export function calculateDiscount(tier: VIPTier, subtotal: number): number {
  const config = TIER_CONFIGS[tier];
  if (!config || config.discount === 0) {
    return 0;
  }
  
  // Only Gold tier gets cart discount (5%)
  return Math.round(subtotal * (config.discount / 100));
}

/**
 * Get tier badge CSS classes
 * @param tier - VIP tier
 * @returns Tailwind CSS classes for tier badge
 */
export function getTierBadgeClasses(tier: VIPTier): string {
  const colorClasses: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-700',
    silver: 'bg-gray-200 text-gray-800',
    amber: 'bg-amber-100 text-amber-700',
    purple: 'bg-purple-100 text-purple-700',
  };
  
  const config = TIER_CONFIGS[tier] || TIER_CONFIGS.member;
  return colorClasses[config.color] || colorClasses.gray;
}

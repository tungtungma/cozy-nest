export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Vercel Cron Secret for security
const CRON_SECRET = process.env.CRON_SECRET;

/**
 * CRON JOB: Reset VIP tiers after 1-year cycle
 * 
 * Runs daily at 2:00 AM HKT (6:00 PM UTC)
 * Configured in vercel.json
 * 
 * CRITICAL: This performs HARD RESET
 * - Downgrades tier to 'member'
 * - Resets currentCycleSpend to 0
 * - Clears tierAchievedAt
 * 
 * Security: Requires CRON_SECRET environment variable
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      console.error('❌ Unauthorized cron job access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Starting VIP tier reset cron job...');

    // Find users whose 1-year cycle has expired
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const expiredUsers = await prisma.user.findMany({
      where: {
        tier: {
          not: 'member',  // Only check non-member tiers
        },
        tierAchievedAt: {
          lte: oneYearAgo,  // Achieved tier >= 1 year ago
          not: null,
        },
      },
      select: {
        id: true,
        email: true,
        tier: true,
        tierAchievedAt: true,
        currentCycleSpend: true,
      },
    });

    console.log(`🔍 Found ${expiredUsers.length} users due for tier reset`);

    if (expiredUsers.length === 0) {
      return NextResponse.json({
        message: 'No users due for tier reset',
        processed: 0,
        succeeded: 0,
        failed: 0,
        timestamp: new Date().toISOString(),
      });
    }

    // Perform hard reset for each user
    const resetResults = await Promise.all(
      expiredUsers.map(async (user) => {
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              tier: 'member',           // HARD RESET to base tier
              tierAchievedAt: null,     // Clear achievement date
              currentCycleSpend: 0,     // Reset spend to zero
            },
          });

          console.log(
            `✅ Reset ${user.email}: ${user.tier} → member (was ${user.currentCycleSpend} HKD)`
          );

          return { success: true, userId: user.id, email: user.email };
        } catch (error) {
          console.error(`❌ Failed to reset user ${user.id}:`, error);
          return { success: false, userId: user.id, error: String(error) };
        }
      })
    );

    const successCount = resetResults.filter((r) => r.success).length;
    const failCount = resetResults.filter((r) => !r.success).length;

    console.log(`🎯 Tier reset complete: ${successCount} succeeded, ${failCount} failed`);

    return NextResponse.json({
      message: 'Tier reset completed',
      processed: expiredUsers.length,
      succeeded: successCount,
      failed: failCount,
      details: resetResults,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Tier reset cron job failed:', error);
    return NextResponse.json(
      { 
        error: 'Tier reset failed', 
        details: String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

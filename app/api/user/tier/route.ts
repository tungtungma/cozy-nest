export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isResetDue } from '@/types/vip-tier';

/**
 * GET /api/user/tier
 * Returns the current user's VIP tier information
 * Also checks if tier reset is due (safety net for 1-year hard reset)
 */
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ tier: 'member' }); // Default for non-authenticated
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        tier: true,
        tierAchievedAt: true,
        currentCycleSpend: true,
        lifetimeSpend: true,
      },
    });

    if (!user) {
      return NextResponse.json({ tier: 'member' });
    }

    // SAFETY NET: Check if tier reset is due (1-year expiry)
    if (user.tier !== 'member' && isResetDue(user.tierAchievedAt)) {
      // Perform hard reset
      await prisma.user.update({
        where: { id: user.id },
        data: {
          tier: 'member',
          tierAchievedAt: null,
          currentCycleSpend: 0,
        },
      });

      console.log(`⏰ Hard reset on tier fetch: User ${user.id} → member (1-year expiry)`);

      return NextResponse.json({
        tier: 'member',
        tierAchievedAt: null,
        currentCycleSpend: 0,
        lifetimeSpend: parseFloat(user.lifetimeSpend.toString()),
      });
    }

    return NextResponse.json({
      tier: user.tier,
      tierAchievedAt: user.tierAchievedAt,
      currentCycleSpend: parseFloat(user.currentCycleSpend.toString()),
      lifetimeSpend: parseFloat(user.lifetimeSpend.toString()),
    });
  } catch (error) {
    console.error('Failed to fetch user tier:', error);
    return NextResponse.json({ tier: 'member' }); // Fail gracefully
  }
}

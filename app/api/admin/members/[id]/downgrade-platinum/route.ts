export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { calculateTierFromSpend } from '@/types/vip-tier';

/**
 * POST /api/admin/members/[id]/downgrade-platinum
 * Downgrade a Platinum user back to their spend-based tier
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAdmin();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const userId = params.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        tier: true,
        currentCycleSpend: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.tier !== 'platinum') {
      return NextResponse.json(
        { error: 'User is not Platinum tier' },
        { status: 400 }
      );
    }

    // Calculate tier based on current spend
    const currentSpend = parseFloat(user.currentCycleSpend.toString());
    const calculatedTier = calculateTierFromSpend(currentSpend);

    await prisma.user.update({
      where: { id: userId },
      data: {
        tier: calculatedTier,
        // Keep tierAchievedAt and currentCycleSpend unchanged
      },
    });

    console.log(`📉 Admin downgraded ${user.email} from Platinum to ${calculatedTier} (spend: ${currentSpend} HKD)`);

    return NextResponse.json({
      message: `Successfully downgraded ${user.email} from Platinum to ${calculatedTier}`,
      tier: calculatedTier,
      currentCycleSpend: currentSpend,
    });
  } catch (error) {
    console.error('Failed to downgrade from Platinum:', error);
    return NextResponse.json(
      { error: 'Failed to downgrade from Platinum' },
      { status: 500 }
    );
  }
}

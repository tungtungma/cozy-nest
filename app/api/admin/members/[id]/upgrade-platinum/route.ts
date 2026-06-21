export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/admin/members/[id]/upgrade-platinum
 * Manually upgrade a user to Platinum tier
 * 
 * IMPORTANT: This is the ONLY way to achieve Platinum tier
 * Admins can upgrade ANY user regardless of spend (for grandfathering offline customers)
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
        role: true,
        currentCycleSpend: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role === 'pending') {
      return NextResponse.json(
        { error: 'Cannot upgrade pending users. Please approve them first.' },
        { status: 400 }
      );
    }

    if (user.tier === 'platinum') {
      return NextResponse.json(
        { error: 'User is already Platinum tier' },
        { status: 400 }
      );
    }

    // Manual upgrade to Platinum - no spend requirement
    await prisma.user.update({
      where: { id: userId },
      data: {
        tier: 'platinum',
        tierAchievedAt: new Date(), // Start 1-year timer
        // Keep currentCycleSpend unchanged - this is for offline customers
      },
    });

    console.log(`💎 Admin upgraded ${user.email} to Platinum tier (spend: ${user.currentCycleSpend} HKD)`);

    return NextResponse.json({
      message: `Successfully upgraded ${user.email} to Platinum tier`,
      tier: 'platinum',
      tierAchievedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to upgrade to Platinum:', error);
    return NextResponse.json(
      { error: 'Failed to upgrade to Platinum' },
      { status: 500 }
    );
  }
}

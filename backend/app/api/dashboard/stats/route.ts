import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Real counts
    const [totalEmails, unreadCount, starredCount, categoryCounts, emailsWithSummary] = await Promise.all([
      prisma.email.count({ where: { userId: user.id } }),
      prisma.email.count({ where: { userId: user.id, isRead: false } }),
      prisma.email.count({ where: { userId: user.id, isStarred: true } }),
      prisma.email.groupBy({
        by: ['category'],
        where: { userId: user.id },
        _count: { id: true },
      }),
      prisma.email.count({
        where: { userId: user.id, aiSummary: { not: null } },
      }),
    ]);

    const categories = categoryCounts.map((c) => ({
      category: c.category || 'Uncategorized',
      count: c._count.id,
    }));

    // Recent activity (real, derived from data)
    const activities = [
      {
        text: `${emailsWithSummary} emails summarized by AI`,
        time: 'Total',
        icon: 'Brain',
      },
      {
        text: `${unreadCount} unread emails need attention`,
        time: 'Now',
        icon: 'AlertCircle',
      },
      {
        text: `${totalEmails} emails synced from Gmail`,
        time: 'Total',
        icon: 'Mail',
      },
    ];

    // AI usage stats (real)
    const aiUsage = [
      { label: 'Summaries Generated', value: emailsWithSummary },
      { label: 'Starred Emails', value: starredCount },
      { label: 'Total Synced', value: totalEmails },
    ];

    return NextResponse.json({
      totalEmails,
      unreadCount,
      starredCount,
      categories,
      activities,
      aiUsage,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({
      totalEmails: 0,
      unreadCount: 0,
      starredCount: 0,
      categories: [],
      activities: [],
      aiUsage: [],
    });
  }
}
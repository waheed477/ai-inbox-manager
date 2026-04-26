import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { google } from 'googleapis';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { to, subject, body, scheduledAt, threadId } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user?.refreshToken) {
      return NextResponse.json({ error: 'Gmail not connected' }, { status: 400 });
    }

    // Store scheduled email in DB
    const scheduled = await prisma.email.create({
      data: {
        userId: user.id,
        gmailId: `scheduled_${Date.now()}`,
        threadId: threadId || '',
        from: session.user.email,
        to: Array.isArray(to) ? to : [to],
        subject,
        body,
        snippet: body?.substring(0, 100) || '',
        labels: ['SCHEDULED'],
        isRead: true,
        receivedAt: new Date(scheduledAt),
      },
    });

    return NextResponse.json({ success: true, scheduledAt, id: scheduled.id });
  } catch (error: any) {
    console.error('Schedule error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const scheduled = await prisma.email.findMany({
    where: {
      userId: user.id,
      labels: { has: 'SCHEDULED' },
    },
    orderBy: { receivedAt: 'asc' },
  });

  return NextResponse.json(scheduled);
}
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { settings: true },
  });

  if (!user?.settings) {
    return NextResponse.json({
      defaultTone: 'professional',
      autoArchive: { promotions: false, newsletters: false },
      notifications: true,
    });
  }

  return NextResponse.json(user.settings);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const settings = await prisma.settings.upsert({
    where: { userId: user.id },
    update: {
      defaultTone: body.defaultTone,
      autoArchive: body.autoArchive,
      notifications: body.notifications,
    },
    create: {
      userId: user.id,
      defaultTone: body.defaultTone || 'professional',
      autoArchive: body.autoArchive || {},
      notifications: body.notifications ?? true,
    },
  });

  return NextResponse.json(settings);
}
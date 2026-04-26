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

    const archivedEmails = await prisma.email.findMany({
      where: {
        userId: user.id,
        isArchived: true,
      },
      orderBy: { receivedAt: 'desc' },
    });

    return NextResponse.json(archivedEmails);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
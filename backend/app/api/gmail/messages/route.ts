import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const user = await prisma.user.findFirst();
  if (!user) {
    return NextResponse.json({ error: 'No user found. Run sync first.' }, { status: 404 });
  }

  const emails = await prisma.email.findMany({
    where: { userId: user.id },
    orderBy: { receivedAt: 'desc' },
    take: 50,
  });

  return NextResponse.json(emails);
}
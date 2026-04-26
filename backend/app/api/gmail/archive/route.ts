import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { emailId } = await req.json();

    const email = await prisma.email.update({
      where: { id: emailId },
      data: { isArchived: true, labels: { push: 'ARCHIVED' } },
    });

    return NextResponse.json({ success: true, isArchived: email.isArchived });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
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
    const { query } = await req.json();
    if (!query || query.trim().length === 0) {
      return NextResponse.json({ results: [] });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const searchTerm = query.toLowerCase();

    const allEmails = await prisma.email.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        subject: true,
        snippet: true,
        from: true,
        receivedAt: true,
        body: true,
      },
      orderBy: { receivedAt: 'desc' },
      take: 200,
    });

    // Simple relevance scoring
    const results = allEmails
      .map(email => {
        let score = 0;
        const subject = (email.subject || '').toLowerCase();
        const snippet = (email.snippet || '').toLowerCase();
        const from = (email.from || '').toLowerCase();
        const body = (email.body || '').toLowerCase();

        if (subject.includes(searchTerm)) score += 10;
        if (from.includes(searchTerm)) score += 8;
        if (snippet.includes(searchTerm)) score += 5;
        if (body.includes(searchTerm)) score += 3;

        // Word-by-word matching
        const queryWords = searchTerm.split(/\s+/);
        queryWords.forEach(word => {
          if (subject.includes(word)) score += 4;
          if (snippet.includes(word)) score += 2;
        });

        return { ...email, score };
      })
      .filter(e => e.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(({ id, subject, snippet, from, receivedAt }) => ({
        id, subject, snippet, from, receivedAt,
      }));

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json({ results: [] });
  }
}
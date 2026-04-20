import { NextRequest, NextResponse } from 'next/server';
import { getGmailClient } from '@/lib/gmail';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const gmail = await getGmailClient();
    
    // Get or create a dummy user for email storage
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'waheedchadhar333@gmail.com',
          googleId: '116793138027112097925',
        },
      });
    }

    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 20,
      labelIds: ['INBOX'],
    });

    const messages = response.data.messages || [];
    const emails = [];

    for (const msg of messages) {
      const detail = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id!,
        format: 'full',
      });

      const headers = detail.data.payload?.headers || [];
      const subject = headers.find((h: any) => h.name === 'Subject')?.value || '(No Subject)';
      const from = headers.find((h: any) => h.name === 'From')?.value || '';

      let body = '';
      if (detail.data.payload?.parts) {
        const textPart = detail.data.payload.parts.find((p: any) => p.mimeType === 'text/plain');
        if (textPart?.body?.data) {
          body = Buffer.from(textPart.body.data, 'base64').toString();
        }
      } else if (detail.data.payload?.body?.data) {
        body = Buffer.from(detail.data.payload.body.data, 'base64').toString();
      }

      const email = await prisma.email.upsert({
        where: { gmailId: detail.data.id! },
        update: { labels: detail.data.labelIds || [] },
        create: {
          gmailId: detail.data.id!,
          threadId: detail.data.threadId!,
          userId: user.id,
          from,
          to: [],
          subject,
          body,
          snippet: detail.data.snippet || '',
          labels: detail.data.labelIds || [],
          receivedAt: new Date(parseInt(detail.data.internalDate || '0')),
        },
      });
      emails.push(email);
    }

    return NextResponse.json({ success: true, count: emails.length });
  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
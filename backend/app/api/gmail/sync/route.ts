import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getGmailClient } from '@/lib/gmail';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    if (!user.refreshToken) {
      return NextResponse.json({ error: 'No Gmail refresh token found' }, { status: 400 });
    }

    const gmail = await getGmailClient(user.email);
    
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 20,
      labelIds: ['INBOX'],
    });

    const messages = response.data.messages || [];
    const emails = [];

    for (const msg of messages) {
      try {
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
          update: { 
            labels: detail.data.labelIds || [],
            snippet: detail.data.snippet || '',
          },
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
      } catch (err) {
        console.error('Failed to process email:', msg.id, err);
      }
    }

    return NextResponse.json({ 
      success: true, 
      count: emails.length,
      message: `Synced ${emails.length} emails` 
    });

  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json({ 
      error: error.message || 'Sync failed' 
    }, { status: 500 });
  }
}
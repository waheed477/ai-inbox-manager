import { NextRequest, NextResponse } from 'next/server';
import { suggestReplies } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { emailBody } = await req.json();
    const replies = await suggestReplies(emailBody);
    return NextResponse.json({ replies });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
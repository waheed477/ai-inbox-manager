import { NextRequest, NextResponse } from 'next/server';
import { summarizeEmail } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { emailBody } = await req.json();
    const summary = await summarizeEmail(emailBody);
    return NextResponse.json({ summary });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
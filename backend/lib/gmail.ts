import { google } from 'googleapis';
import { prisma } from './prisma';

export async function getGmailClient(userEmail: string) {
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user?.refreshToken) {
    throw new Error('No refresh token found for user');
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL + '/api/auth/callback/google'
  );

  oauth2Client.setCredentials({
    refresh_token: user.refreshToken,
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}
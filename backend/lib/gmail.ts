import { google } from 'googleapis';

const HARDCODED_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN || '';

export async function getGmailClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL + '/api/auth/callback/google'
  );

  oauth2Client.setCredentials({
    refresh_token: HARDCODED_REFRESH_TOKEN,
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}


import { NextApiRequest, NextApiResponse } from 'next';
import { OAuth2Client } from 'google-auth-library';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // For Replit, ensure we always use https and the correct host
  const host = req.headers.host;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${host}`;
  const redirectUri = `${baseUrl}/api/auth/callback/`;
  
  console.log('Redirect URI:', redirectUri); // Debug log

  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );

  const authorizeUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
  });

  res.redirect(authorizeUrl);
}

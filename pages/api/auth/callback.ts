
import { NextApiRequest, NextApiResponse } from 'next';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // For Replit, ensure we always use https and the correct host
  const host = req.headers.host;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${host}`;
  const redirectUri = `${baseUrl}/api/auth/callback/`;
  
  // console.log('Callback redirect URI:', redirectUri); // Debug log

  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'No authorization code provided' });
  }
 // Debug log
  try {
    const { tokens } = await client.getToken(code as string);
    client.setCredentials(tokens);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    
    if (!payload) {
      return res.status(400).json({ error: 'Invalid token payload' });
    }


    const userInfo = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };

     // save the certificate to the database
        const formData = {
          name: payload.email,
          email: payload.name,
        };
        try {
          const response = await fetch("/api/submit-user", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          });
          console.log("User submitted successfully:", response);
        } catch (error) {
          console.error("Error submitting certificate:", error);
        }

    // Create a JWT token for session management
    const sessionToken = jwt.sign(
      userInfo,
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    // Set HTTP-only cookie
    res.setHeader(
      'Set-Cookie',
      `session=${sessionToken}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`
    );

    res.redirect('/');
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

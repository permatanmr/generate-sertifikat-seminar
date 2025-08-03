
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { session } = req.cookies;

  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(session, process.env.JWT_SECRET || 'fallback-secret');
    res.json(decoded);
  } catch (error) {
    res.status(401).json({ error: 'Invalid session' });
  }
}

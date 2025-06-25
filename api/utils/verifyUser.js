// backend/middleware/verifyToken.js
import dotenv from 'dotenv';
dotenv.config(); // ✅ MUST be called before process.env access

import { createClient } from '@supabase/supabase-js';

// Validate .env variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error('Supabase environment variables not loaded');
}

// Use service role key if you’re performing admin actions (optional)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY // or SUPABASE_SERVICE_ROLE_KEY if needed
);

// Middleware to verify JWT from Supabase Auth
export const verifyToken = async (req, res, next) => {
  const token =
    req.cookies.access_token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(403).json({ error: 'Forbidden: Invalid token' });
    }

    // Attach user info to the request
    req.user = {
      id: user.id,
      email: user.email,
      username: user.user_metadata?.full_name || user.email,
    };

    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

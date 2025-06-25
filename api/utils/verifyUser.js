import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error('Supabase environment variables not loaded');
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export const verifyToken = async (req, res, next) => {
  const token = 
    req.cookies.access_token || 
    req.headers.authorization?.split(' ')[1] ||
    req.headers.Authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false,
      error: 'Unauthorized: No token provided' 
    });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(403).json({ 
        success: false,
        error: 'Forbidden: Invalid or expired token' 
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      username: user.user_metadata?.full_name || user.email,
    };

    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    res.status(500).json({ 
      success: false,
      error: 'Internal Server Error' 
    });
  }
};

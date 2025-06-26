import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import jwt from 'jsonwebtoken';

import usertRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';

dotenv.config();

const __dirname = path.resolve();
const app = express();

// ✅ CORS: Allow frontend origin in dev and production
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://home-connect-v2qg.onrender.com'
    : 'http://localhost:5173',
  credentials: true
}));

// ✅ JSON body parsing & cookies
app.use(express.json());
app.use(cookieParser());

// ✅ Health check for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// ✅ Root test
app.get('/', (req, res) => {
  res.send('Hello JC - HomeNest backend is live!');
});

// ✅ API routes
app.use('/api/user', usertRouter);
app.use('/api/auth', authRouter);
app.use('/api/listing', listingRouter);

// ✅ Supabase token generation route
app.post('/api/create-supabase-token', async (req, res) => {
  try {
    const { firebaseUid, email } = req.body;

    if (!firebaseUid) {
      return res.status(400).json({ error: 'Firebase UID required' });
    }

    const payload = {
      aud: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
      iat: Math.floor(Date.now() / 1000),
      iss: 'supabase',
      sub: firebaseUid,
      email: email || '',
      role: 'authenticated',
      user_metadata: {
        firebase_uid: firebaseUid
      }
    };

    const token = jwt.sign(payload, process.env.SUPABASE_SERVICE_ROLE_KEY);
    res.json({ access_token: token, expires_in: 86400 });

  } catch (error) {
    console.error('Token creation error:', error);
    res.status(500).json({ error: 'Failed to create token' });
  }
});

// ✅ Serve static React build in production
app.use(express.static(path.join(__dirname, '/client/dist')));

// ✅ Catch-all route (for React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message
  });
});

// ✅ MongoDB connection & server start
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.mongo, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

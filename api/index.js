import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import usertRouter from './routes/user.route.js'
import authRouter from './routes/auth.route.js'
import listingRouter from './routes/listing.route.js'
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
dotenv.config();
mongoose.connect(process.env.mongo).then(()=>{
    console.log('Connected to MongoDB!!')
}).catch((err)=>{
    console.log(err);
})
const __dirname=path.resolve();
const app=express();
// ✅ This must come before route handlers
app.use(cors({
  origin: 'http://localhost:5173', // Replace with your React app's origin
  credentials: true               // 🔥 Allows cookies to be sent
}));
// 🟢 Important: Parse incoming JSON
app.use(express.json());
app.use(cookieParser());
app.listen(3000,()=>{
    console.log('server is running on port 3000!')
})//express server is running on 3000
app.get('/',(req,res)=>{
    res.send('hello jc');
})
// create seperate folder for apis as it becomes clumsy here
app.use('/api/user',usertRouter);
app.use('/api/auth',authRouter);
app.use('/api/listing',listingRouter);

app.use(express.static(path.join(__dirname,'/client/dist')));

app.get('/*',(req,res)=>{
    res.sendFile(path.join(__dirname,'client','dist','index.html'))
})
//middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
    });
  });
  // Add to your existing Express server file
import jwt from 'jsonwebtoken';

// Add this route to your existing routes
app.post('/api/create-supabase-token', async (req, res) => {
  try {
    const { firebaseUid, email } = req.body;

    if (!firebaseUid) {
      return res.status(400).json({ error: 'Firebase UID required' });
    }

    // Create Supabase JWT payload
    const payload = {
      aud: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours
      iat: Math.floor(Date.now() / 1000),
      iss: 'supabase',
      sub: firebaseUid,
      email: email || '',
      role: 'authenticated',
      user_metadata: {
        firebase_uid: firebaseUid
      }
    };

    // Sign JWT with Supabase secret
    const token = jwt.sign(payload, process.env.SUPABASE_JWT_SECRET);

    res.json({ 
      access_token: token,
      expires_in: 86400
    });

  } catch (error) {
    console.error('Token creation error:', error);
    res.status(500).json({ error: 'Failed to create token' });
  }
});
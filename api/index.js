import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import usertRouter from './routes/user.route.js'
import authRouter from './routes/auth.route.js'
dotenv.config();
mongoose.connect(process.env.mongo).then(()=>{
    console.log('Connected to MongoDB!!')
}).catch((err)=>{
    console.log(err);
})

const app=express();
// 🟢 Important: Parse incoming JSON
app.use(express.json());
app.listen(3000,()=>{
    console.log('server is running on port 3000!')
})//express server is running on 3000
app.get('/',(req,res)=>{
    res.send('hello jc');
})
// create seperate folder for apis as it becomes clumsy here
app.use('/api/user',usertRouter);
app.use('/api/auth',authRouter);
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
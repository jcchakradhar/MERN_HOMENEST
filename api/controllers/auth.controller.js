import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from 'jsonwebtoken';
export const signup=async(req,res,next)=>{
    const {username,email,password}=req.body;//comes from signup
    const hashedPassword=bcryptjs.hashSync(password,10);//10 is a string which combines with our hashed password
    const newuser=new User({username,email,password:hashedPassword});
    try{
        await newuser.save();
        res.status(201).json({
            success: true,
            message: 'User created successfully',
          });
    } catch(error){
        next(errorHandler(550,'error from the function'));
    }
    
};
export const signin=async(req,res,next)=>{
    const {email,password}=req.body;
    try{
        const validuser=await User.findOne({email:email});
        if(!validuser) return next(errorHandler(404,'user not found'));
        //check password
        const validpassword=bcryptjs.compareSync(password,validuser.password);
        //if password is not valid return error using middleware
        if(!validpassword)next(errorHandler(404,'Wrong Credentials'));
        //If email exists and password matches, sign-in is successful!
        //create token
        const token=jwt.sign({id:validuser._id},process.env.JWT_SECRET)
        const { password: pass, ...rest } = validuser._doc;
        res
        .cookie('access_token', token, { httpOnly: true })
        .status(200)
        .json(rest);
        //remove password as validuserr sends whole its body


    }catch(error){

    }
};
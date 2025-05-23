import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
export const signup=async(req,res)=>{
    const {username,email,password}=req.body;
    const hashedPassword=bcryptjs.hashSync(password,10);//10 is a string which combines with our hashed password
    const newuser=new User({username,email,password:hashedPassword});
    try{
        await newuser.save();
    res.status(201).json('User created succesfully');
    } catch(error){
        res.status(500).json(error.message);
    }
    
};
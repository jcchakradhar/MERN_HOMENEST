import mongoose from 'mongoose';
const userschema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    avatar:{
        type:String,
        default:"https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg",
    },
},{timestamps:true}
);
const User=mongoose.model('User',userschema);
export default User;
import User from "../models/user.model.js"
import { errorHandler } from "../utils/error.js"
import bcryptjs from "bcryptjs"
export const test=(req,res)=>{
    res.json({
        message:"hello jc the api is tested njoy!",
    })
}
export const updateUser=async(req,res,next)=>{
    if(req.user.id!==req.params.id) return next(errorHandler(401,"you can only update your own account!"))
    try{
if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }
 const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {//since user can send any of these data
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          avatar: req.body.avatar,
        },
      },
      { new: true }//this will save new users information
    );

    const { password, ...rest } = updatedUser._doc;

    res.status(200).json(rest);

}catch(error){
    next(error);
}
};
export const deleteUser=async(req,res,next)=>{
    if(req.user.id!==req.params.id){
        return next(errorHandler(401,'you can delete your own account'));
    }
    try{
        await User.findByIdAndDelete(req.params.id)
        res.clearCookie('access_token');
        res.status(200).json('User has been deleted')
    }
    catch(error){
        next(error)
    }
};
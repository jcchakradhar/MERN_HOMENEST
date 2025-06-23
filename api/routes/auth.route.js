import express from 'express'
import { signin, signup ,google, signOut} from '../controllers/auth.controller.js';
const router=express.Router();
router.post("/signup",signup);//creates new user acnt in database so post
router.post("/signin",signin);//sends sensitive data in req.body ,creates session,so post
router.post("/google",google);//Creates session, handles tokens securely
router.get("/signout",signOut);
export default router;
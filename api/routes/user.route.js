import express from 'express';
import { test, updateUser,deleteUser,getUserListings} from '../controllers/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
const router=express.Router();
router.get('/test',test);// When a GET request is made to /test, call the 'test' function
router.post('/update/:id',verifyToken ,updateUser);
router.delete('/delete/:id',verifyToken ,deleteUser);
router.get('/listings/:id',verifyToken,getUserListings);
export default router;
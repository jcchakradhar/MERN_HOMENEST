import express from 'express';
import { test } from '../controllers/user.controller.js';
const router=express.Router();
router.get('/test',test);// When a GET request is made to /test, call the 'test' function
export default router;
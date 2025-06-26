import express from 'express'
import { createListing, getListings } from '../controllers/listing.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
import { deleteListing ,updateListing,getListing} from '../controllers/listing.controller.js';
const router=express.Router();
router.post('/create', verifyToken,createListing);
//Create = Making something new that didn't exist before on the server
router.delete('/delete/:id',verifyToken,deleteListing);
router.post('/update/:id', verifyToken, updateListing);
router.get('/get/:id', getListing);
router.get('/get',getListings);
export default router;
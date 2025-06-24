import Listing from "../models/listing.model.js";

export const createListing=async(req,res,next)=>{
    
    try{
        const listing =await Listing.create(req.body);//req.body comes from browser
        return res.status(201).json(Listing);
    }catch(error){
        next(error);

    }
}
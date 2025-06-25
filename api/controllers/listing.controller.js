import { createClient } from '@supabase/supabase-js';
import { errorHandler } from "../utils/error.js";
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Create listing in Supabase
export const createListing = async (req, res, next) => {
  try {
    const { data: listing, error } = await supabase
      .from('listings')
      .insert([{
        ...req.body,
        userref: req.user.id // Use Supabase user ID
      }])
      .select()
      .single();

    if (error) {
      return next(errorHandler(500, error.message));
    }

    return res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
};

// Delete listing from Supabase
export const deleteListing = async (req, res, next) => {
  try {
    // First, get the listing to check ownership
    const { data: listing, error: fetchError } = await supabase
      .from('listings')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !listing) {
      return next(errorHandler(404, 'Listing not found!'));
    }

    if (req.user.id !== listing.userref) {
      return next(errorHandler(401, 'You can only delete your own listings!'));
    }

    // Delete the listing
    const { error: deleteError } = await supabase
      .from('listings')
      .delete()
      .eq('id', req.params.id);

    if (deleteError) {
      return next(errorHandler(500, deleteError.message));
    }

    res.status(200).json({ message: 'Listing has been deleted!' });
  } catch (error) {
    next(error);
  }
};

// Update listing in Supabase
export const updateListing = async (req, res, next) => {
  try {
    // First, get the listing to check ownership
    const { data: listing, error: fetchError } = await supabase
      .from('listings')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !listing) {
      return next(errorHandler(404, 'Listing not found!'));
    }

    if (req.user.id !== listing.userref) {
      return next(errorHandler(401, 'You can only update your own listings!'));
    }

    // Update the listing
    const { data: updatedListing, error: updateError } = await supabase
      .from('listings')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) {
      return next(errorHandler(500, updateError.message));
    }

    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};

// Get single listing
export const getListing = async (req, res, next) => {
  try {
    const { data: listing, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !listing) {
      return next(errorHandler(404, 'Listing not found!'));
    }

    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

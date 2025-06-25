import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import bcryptjs from "bcryptjs";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Only import and create Supabase client if env vars exist
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  const { createClient } = await import('@supabase/supabase-js');
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  console.log('✅ Supabase client initialized');
} else {
  console.log('❌ Supabase environment variables missing');
}

// Test route
export const test = (req, res) => {
  res.status(200).json({
    success: true,
    message: "hello jc the api is tested njoy!",
  });
};

// Update user
export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(401, "You can only update your own account!"));
  }

  try {
    // 1. Update Supabase Auth first
    const updateData = {
      user_metadata: {
        full_name: req.body.username,
        avatar_url: req.body.avatar,
      },
      email: req.body.email,
    };

    if (req.body.password) {
      updateData.password = req.body.password;
    }

    const { data: updatedSupabaseUser, error: supabaseError } = await supabase.auth.admin.updateUserById(
      req.params.id,
      updateData
    );

    if (supabaseError) {
      return next(errorHandler(500, supabaseError.message));
    }

    // 2. Update MongoDB User (find by supabaseId or email)
    let updatedMongoUser;
    
    // Try to find user by supabaseId first
    updatedMongoUser = await User.findOneAndUpdate(
      { supabaseId: req.params.id },
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          avatar: req.body.avatar,
          ...(req.body.password && { 
            password: bcryptjs.hashSync(req.body.password, 10) 
          }),
        },
      },
      { new: true }
    );

    // If not found by supabaseId, try by email
    if (!updatedMongoUser) {
      updatedMongoUser = await User.findOneAndUpdate(
        { email: req.body.email },
        {
          $set: {
            username: req.body.username,
            email: req.body.email,
            avatar: req.body.avatar,
            supabaseId: req.params.id, // Add supabaseId for future updates
            ...(req.body.password && { 
              password: bcryptjs.hashSync(req.body.password, 10) 
            }),
          },
        },
        { new: true, upsert: true } // Create if doesn't exist
      );
    }

    // 3. Return the updated user data
    const { password, ...rest } = updatedMongoUser._doc;
    
    res.status(200).json({
      ...rest,
      id: updatedSupabaseUser.user.id, // Keep Supabase ID as primary
      username: updatedSupabaseUser.user.user_metadata?.full_name,
      avatar: updatedSupabaseUser.user.user_metadata?.avatar_url,
    });

  } catch (error) {
    console.error('Update user error:', error);
    next(error);
  }
};


// Delete user
export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(401, "You can only delete your own account!"));
  }

  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    
    if (!deletedUser) {
      return next(errorHandler(404, "User not found"));
    }
    
    res.clearCookie("access_token");
    res.status(200).json({
      success: true,
      message: "User has been deleted",
    });
  } catch (error) {
    next(error);
  }
};

// Get user listings from Supabase
export const getUserListings = async (req, res, next) => {
  console.log('🔍 getUserListings called');
  console.log('👤 Request user:', req.user);
  console.log('📋 Request params:', req.params);
  
  if (req.user.id === req.params.id) {
    try {
      // Check if Supabase is available
      if (!supabase) {
        console.error('❌ Supabase not initialized');
        return next(errorHandler(500, 'Database configuration error'));
      }
      
      console.log('🔎 Searching Supabase for listings with userRef:', req.params.id);
      
      const { data: listings, error } = await supabase
        .from('listings') // Make sure this matches your table name
        .select('*')
        .eq('userref', req.params.id); // Make sure this matches your column name
      
      if (error) {
        console.error('💥 Supabase error:', error);
        return next(errorHandler(500, error.message));
      }
      
      console.log('📊 Found listings:', listings?.length || 0);
      console.log('📋 Listings data:', listings);
      
      res.status(200).json(listings || []);
    } catch (error) {
      console.error('💥 Database error:', error);
      next(error);
    }
  } else {
    console.error('❌ Authorization failed');
    return next(errorHandler(401, 'You can only view your own listings!'));
  }
};

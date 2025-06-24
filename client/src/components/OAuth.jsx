// src/components/OAuth.jsx
import React from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

export default function OAuth() {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      console.error('Google Sign-in Error:', error.message);
    } else {
      // After login, Supabase redirects back to your site (defined in Google Cloud)
      // You can fetch user data from supabase.auth.getUser() in App.jsx or Layout
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      type="button"
      className="bg-red-700 text-white p-3 rounded-lg uppercase hover:opacity-90"
    >
      Continue with Google
    </button>
  );
}

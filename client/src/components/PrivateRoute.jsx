import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { supabase } from '../supabase';

export default function PrivateRoute() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('PrivateRoute - checking user:', user); // Debug log
      setUser(user);
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('PrivateRoute - auth changed:', event, session?.user); // Debug log
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="p-3 max-w-lg mx-auto">Checking authentication...</div>;
  }

  console.log('PrivateRoute - final decision:', user ? 'Allow' : 'Redirect'); // Debug log
  return user ? <Outlet /> : <Navigate to='/sign-in' />;
}
import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabase';

export default function PrivateRoute() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkUser = async () => {
      try {
        // Check both session and user
        const { data: { session } } = await supabase.auth.getSession();
        const { data: { user } } = await supabase.auth.getUser();
        
        console.log('PrivateRoute Debug:', {
          path: location.pathname,
          hasSession: !!session,
          hasUser: !!user,
          sessionUser: session?.user?.id,
          directUser: user?.id
        });
        
        setUser(session?.user || user || null);
      } catch (error) {
        console.error('PrivateRoute auth check error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('PrivateRoute - auth state changed:', {
        event,
        hasUser: !!session?.user,
        userId: session?.user?.id
      });
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [location.pathname]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Debug final decision
  console.log('PrivateRoute - Final Decision:', {
    hasUser: !!user,
    action: user ? 'Allow access' : 'Redirect to sign-in',
    currentPath: location.pathname
  });

  // Return protected content or redirect
  return user ? <Outlet /> : <Navigate to="/sign-in" state={{ from: location }} replace />;
}

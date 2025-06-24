import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';

export default function Header() {
  const [currentUser, setCurrentUser] = useState(null);
  const [imageError, setImageError] = useState(false); // for handling broken avatar

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };

    getCurrentUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getAvatar = () => {
    if (!currentUser) return '/default-avatar.png';
    if (imageError) return '/default-avatar.png';

    return (
      currentUser.user_metadata?.avatar_url ||
      currentUser.user_metadata?.picture ||
      '/default-avatar.png'
    );
  };

  return (
    <header className="bg-blue-200 shadow-xl">
      <div className="flex justify-between items-center max-w-6xl mx-auto p-4">
        <Link to='/'>
          <h1 className="font-extrabold text-2xl">
            <span className="text-cyan-800">Home</span>
            <span className="text-gold">Nest</span>
          </h1>
        </Link>
        <form className="bg-gray-800 px-4 py-2 rounded-lg flex items-center shadow-md">
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent focus:outline-none w-32 sm:w-64 text-white placeholder-gray-400"
          />
        </form>
        <ul className='flex gap-4'>
          <Link to='/'><li className='hidden sm:inline text-slate-700 hover:underline'>Home</li></Link>
          <Link to='/about'><li className='hidden sm:inline text-slate-700 hover:underline'>About</li></Link>
          <Link to={currentUser ? '/profile' : '/sign-in'}>
            {currentUser ? (
              <img
                className='rounded-full h-7 w-7 object-cover'
                src={getAvatar()}
                alt='profile'
                onError={() => setImageError(true)}
              />
            ) : (
              <li className='text-slate-700 hover:underline'>Sign in</li>
            )}
          </Link>
        </ul>
      </div>
    </header>
  );
}

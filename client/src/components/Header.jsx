import { Search, Home, Info, User, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const [supabaseUser, setSupabaseUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [imageError, setImageError] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Get Supabase user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setSupabaseUser(user);
    };

    getCurrentUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSupabaseUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle search
  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('searchTerm', searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
    setIsMobileMenuOpen(false);
  };

  // Update search term from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [location.search]);

  // Get user avatar
  const getAvatar = () => {
    if (imageError) return '/default-avatar.png';
    
    // Try Supabase user first, then Redux user
    const user = supabaseUser || currentUser;
    if (!user) return '/default-avatar.png';

    return (
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      user.avatar ||
      '/default-avatar.png'
    );
  };

  const user = supabaseUser || currentUser;

  return (
    <header className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 shadow-xl sticky top-0 z-50 backdrop-blur-sm">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-4 py-3">
        {/* Logo */}
        <Link to='/' className="flex-shrink-0">
          <h1 className="font-bold text-xl sm:text-2xl flex items-center">
            <span className="text-white drop-shadow-lg">🏡 Home</span>
            <span className="text-emerald-100 drop-shadow-lg"> Connect</span>
          </h1>
        </Link>

        {/* Desktop Search */}
        <form
          onSubmit={handleSubmit}
          className='hidden md:flex bg-white/90 backdrop-blur-sm p-2 rounded-xl items-center shadow-lg border border-white/20 flex-1 max-w-md mx-6'
        >
          <input
            type='text'
            placeholder='Search properties...'
            className='bg-transparent focus:outline-none flex-1 px-3 py-1 text-gray-700 placeholder-gray-500'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-600 p-2 rounded-lg transition-colors"
          >
            <Search className='text-white' size={18} />
          </button>
        </form>

        {/* Desktop Navigation */}
        <nav className='hidden md:flex items-center gap-6'>
          <Link to='/' className="flex items-center gap-2 text-white hover:text-emerald-100 transition-colors font-medium">
            <Home size={18} />
            <span>Home</span>
          </Link>
          <Link to='/about' className="flex items-center gap-2 text-white hover:text-emerald-100 transition-colors font-medium">
            <Info size={18} />
            <span>About</span>
          </Link>
          <Link to={user ? '/profile' : '/sign-in'}>
            {user ? (
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-xl hover:bg-white/30 transition-all">
                <img
                  className='rounded-full h-8 w-8 object-cover border-2 border-white/50'
                  src={getAvatar()}
                  alt='profile'
                  onError={() => setImageError(true)}
                />
                <span className="text-white font-medium hidden lg:block">
                  {user.user_metadata?.full_name || user.username || 'Profile'}
                </span>
              </div>
            ) : (
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl hover:bg-white/30 transition-all">
                <span className="text-white font-medium flex items-center gap-2">
                  <User size={18} />
                  Sign In
                </span>
              </div>
            )}
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden bg-white/20 backdrop-blur-sm p-2 rounded-lg"
        >
          {isMobileMenuOpen ? (
            <X className="text-white" size={24} />
          ) : (
            <Menu className="text-white" size={24} />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-sm border-t border-white/20">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile Search */}
            <form onSubmit={handleSubmit} className='bg-gray-100 p-3 rounded-xl flex items-center'>
              <input
                type='text'
                placeholder='Search properties...'
                className='bg-transparent focus:outline-none flex-1 text-gray-700 placeholder-gray-500'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit">
                <Search className='text-gray-600' size={20} />
              </button>
            </form>

            {/* Mobile Navigation */}
            <div className="space-y-2">
              <Link 
                to='/' 
                className="flex items-center gap-3 text-gray-700 hover:text-emerald-600 transition-colors p-2 rounded-lg hover:bg-emerald-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home size={20} />
                <span className="font-medium">Home</span>
              </Link>
              <Link 
                to='/about' 
                className="flex items-center gap-3 text-gray-700 hover:text-emerald-600 transition-colors p-2 rounded-lg hover:bg-emerald-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Info size={20} />
                <span className="font-medium">About</span>
              </Link>
              <Link 
                to={user ? '/profile' : '/sign-in'}
                className="flex items-center gap-3 text-gray-700 hover:text-emerald-600 transition-colors p-2 rounded-lg hover:bg-emerald-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {user ? (
                  <>
                    <img
                      className='rounded-full h-6 w-6 object-cover'
                      src={getAvatar()}
                      alt='profile'
                      onError={() => setImageError(true)}
                    />
                    <span className="font-medium">
                      {user.user_metadata?.full_name || user.username || 'Profile'}
                    </span>
                  </>
                ) : (
                  <>
                    <User size={20} />
                    <span className="font-medium">Sign In</span>
                  </>
                )}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

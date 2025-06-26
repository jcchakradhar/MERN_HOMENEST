import { useSelector, useDispatch } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import { supabase } from '../supabase';
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserStart,
  signOutUserSuccess,
} from '../redux/user/userSlice';
import { Link, useNavigate } from 'react-router-dom';
import { User, Camera, Edit, Trash2, LogOut, Plus, Eye, Settings, Home, Upload } from 'lucide-react';

export default function Profile() {
  const fileRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser, loading, error } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    avatar: '',
    password: '',
  });
  const [supabaseUser, setSupabaseUser] = useState(null);
  const [file, setFile] = useState(null);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const [showListingsError, setShowListingsError] = useState('');
  const [listingsLoading, setListingsLoading] = useState(false);
  const [hasClickedShowListings, setHasClickedShowListings] = useState(false);

  // Helper function to get auth headers
  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` }),
    };
  };

  // 1. Get Supabase user session on mount and on auth change
  useEffect(() => {
    const fetchSupabaseUser = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        setSupabaseUser(sessionData.session.user);
      } else {
        setSupabaseUser(null);
      }
    };
    fetchSupabaseUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) setSupabaseUser(session.user);
      else setSupabaseUser(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // 2. Set user data into form when user changes
  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || '',
        email: currentUser.email || '',
        avatar: currentUser.avatar || '',
        password: '',
      });
    } else if (supabaseUser) {
      setFormData({
        username: supabaseUser.user_metadata?.full_name || '',
        email: supabaseUser.email || '',
        avatar: supabaseUser.user_metadata?.avatar_url || '',
        password: '',
      });
    }
  }, [currentUser, supabaseUser]);

  // 3. Handle file upload
  useEffect(() => {
    if (!file) return;

    const upload = async () => {
      setFileUploadError(false);
      setFilePerc(0);
      const fileName = `${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) {
        setFileUploadError(true);
        return;
      }

      const { data: urlData } = await supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      if (!urlData?.publicUrl) {
        setFileUploadError(true);
        return;
      }

      setFilePerc(100);
      const newAvatarUrl = urlData.publicUrl;
      setFormData((prev) => ({ ...prev, avatar: newAvatarUrl }));

      // Update user avatar on backend
      const userId = supabaseUser?.id;
      if (userId) {
        try {
          const headers = await getAuthHeaders();
          const res = await fetch(`/api/user/update/${userId}`, {
            method: 'POST',
            headers,
            credentials: 'include',
            body: JSON.stringify({ ...formData, avatar: newAvatarUrl }),
          });

          if (res.ok) {
            const updatedUser = await res.json();
            dispatch(updateUserSuccess(updatedUser));
          }
        } catch (e) {
          setFileUploadError(true);
        }
      }
    };

    upload();
  }, [file]);

  // 4. Handle input change
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  // 5. Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = supabaseUser?.id;
    
    if (!userId) {
      alert('User not found. Please sign in again.');
      return;
    }
    
    try {
      dispatch(updateUserStart());
      const headers = await getAuthHeaders();
      
      const res = await fetch(`/api/user/update/${userId}`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const text = await res.text();
        dispatch(updateUserFailure(text));
        return;
      }
      
      const data = await res.json();
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (err) {
      dispatch(updateUserFailure(err.message));
    }
  };

  // 6. Delete user
  const handleDeleteUser = async () => {
    const userId = supabaseUser?.id;
    
    if (!userId) {
      alert('User not found. Please sign in again.');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete your account?')) return;
    
    try {
      dispatch(deleteUserStart());
      const headers = await getAuthHeaders();
      
      const res = await fetch(`/api/user/delete/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': headers.Authorization,
        },
        credentials: 'include',
      });

      if (!res.ok) {
        const text = await res.text();
        dispatch(deleteUserFailure(text));
        return;
      }
      
      const data = await res.json();
      dispatch(deleteUserSuccess(data));
      navigate('/');
    } catch (err) {
      dispatch(deleteUserFailure(err.message));
    }
  };

  // 7. Sign out
  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      await supabase.auth.signOut();
      await fetch('/api/auth/signout', { credentials: 'include' });
      dispatch(signOutUserSuccess());
      navigate('/sign-in');
    } catch (err) {
      dispatch(deleteUserFailure(err.message));
    }
  };

  // 8. Show Listings
  const handleShowListings = async () => {
    setHasClickedShowListings(true);
    setListingsLoading(true);
    setShowListingsError('');
    setUserListings([]);
    
    const userId = supabaseUser?.id;
    
    if (!userId) {
      setShowListingsError('User not found. Please sign in again.');
      setListingsLoading(false);
      return;
    }
    
    try {
      const headers = await getAuthHeaders();
      
      const res = await fetch(`/api/user/listings/${userId}`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });
      
      if (!res.ok) {
        const text = await res.text();
        setShowListingsError(text || 'Could not fetch listings.');
        setListingsLoading(false);
        return;
      }
      
      const data = await res.json();
      
      if (!Array.isArray(data)) {
        setShowListingsError('Invalid data format received.');
        setListingsLoading(false);
        return;
      }
      
      setUserListings(data);
      setListingsLoading(false);
      
    } catch (err) {
      setShowListingsError('Network error. Please try again.');
      setListingsLoading(false);
    }
  };

  // 9. Handle Delete Listing
  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      });

      if (res.ok) {
        setUserListings(userListings.filter(listing => listing.id !== listingId));
        console.log('✅ Listing deleted successfully');
      } else {
        console.error('❌ Failed to delete listing');
      }
    } catch (err) {
      console.error('Error deleting listing:', err);
    }
  };

  // 10. Fallback for profile image
  const getAvatarUrl = () => {
    if (formData.avatar?.trim()) return formData.avatar;
    if (currentUser?.avatar?.trim()) return currentUser.avatar;
    if (supabaseUser?.user_metadata?.avatar_url?.trim()) return supabaseUser.user_metadata.avatar_url;
    return '/default-avatar.png';
  };

  // 11. If not authenticated, show message
  if (!currentUser && !supabaseUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl text-center max-w-md">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold mb-4 text-gray-800">Profile Access</h1>
          <p className="text-gray-600 mb-6">You are not signed in. Please sign in to access your profile.</p>
          <Link 
            to="/sign-in" 
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className='p-6 max-w-6xl mx-auto'>
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-emerald-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-8 text-center relative">
            <h1 className='text-4xl font-bold text-white drop-shadow-lg flex items-center justify-center gap-3'>
              <User size={40} />
              My Profile
            </h1>
            <p className="text-emerald-50 mt-2">Manage your account and properties</p>
          </div>

          <div className="p-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Profile Form */}
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-200 mb-6">
                  <h2 className="text-2xl font-semibold text-emerald-800 mb-6 flex items-center">
                    <Settings className="mr-3" size={24} />
                    Account Settings
                  </h2>

                  <form onSubmit={handleSubmit} className='space-y-6'>
                    {/* Profile Picture */}
                    <div className="text-center">
                      <input
                        type='file'
                        ref={fileRef}
                        hidden
                        accept='image/*'
                        onChange={(e) => setFile(e.target.files[0])}
                      />
                      <div className="relative inline-block">
                        <img
                          onClick={() => fileRef.current.click()}
                          src={getAvatarUrl()}
                          alt='profile'
                          className='rounded-full h-32 w-32 object-cover cursor-pointer border-4 border-emerald-200 hover:border-emerald-400 transition-all shadow-lg'
                          onError={(e) => (e.target.src = '/default-avatar.png')}
                        />
                        <div className="absolute bottom-2 right-2 bg-emerald-500 p-2 rounded-full cursor-pointer hover:bg-emerald-600 transition-colors"
                             onClick={() => fileRef.current.click()}>
                          <Camera className="text-white" size={16} />
                        </div>
                      </div>
                      <div className='mt-4 text-sm'>
                        {fileUploadError ? (
                          <p className="text-red-600 bg-red-50 px-3 py-2 rounded-lg">❌ Image upload failed</p>
                        ) : filePerc === 100 ? (
                          <p className="text-green-600 bg-green-50 px-3 py-2 rounded-lg">✅ Upload successful!</p>
                        ) : filePerc > 0 ? (
                          <div className="bg-emerald-50 px-3 py-2 rounded-lg">
                            <p className="text-emerald-600 mb-2">Uploading {filePerc}%</p>
                            <div className="w-full bg-emerald-200 rounded-full h-2">
                              <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{width: `${filePerc}%`}}></div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500">Click to change profile picture</p>
                        )}
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-emerald-800 mb-2 flex items-center">
                          <User className="mr-2" size={16} />
                          Username
                        </label>
                        <input
                          type='text'
                          placeholder='Username'
                          id='username'
                          value={formData.username}
                          onChange={handleChange}
                          className='w-full border-2 border-emerald-200 p-4 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all bg-white/70'
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-emerald-800 mb-2 flex items-center">
                          <span className="mr-2">📧</span>
                          Email
                        </label>
                        <input
                          type='email'
                          placeholder='Email'
                          id='email'
                          value={formData.email}
                          onChange={handleChange}
                          className='w-full border-2 border-emerald-200 p-4 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all bg-white/70'
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-emerald-800 mb-2 flex items-center">
                        <span className="mr-2">🔒</span>
                        New Password
                      </label>
                      <input
                        type='password'
                        placeholder='New Password (leave blank to keep current)'
                        id='password'
                        value={formData.password}
                        onChange={handleChange}
                        className='w-full border-2 border-emerald-200 p-4 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all bg-white/70'
                      />
                    </div>

                    <button
                      disabled={loading}
                      className='w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-2'
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Edit size={20} />
                          Update Profile
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Messages */}
                {error && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-xl mb-4">
                    <p className='text-red-700'>❌ {error}</p>
                  </div>
                )}
                {updateSuccess && (
                  <div className="bg-green-50 border border-green-200 p-4 rounded-xl mb-4">
                    <p className='text-green-700'>✅ Profile updated successfully!</p>
                  </div>
                )}
              </div>

              {/* Right Column - Quick Actions */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-2xl border border-cyan-200">
                  <h3 className="text-xl font-semibold text-cyan-800 mb-4 flex items-center">
                    <span className="mr-2">⚡</span>
                    Quick Actions
                  </h3>
                  
                  <div className="space-y-3">
                    <Link
                      to='/create-listing'
                      className='w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white p-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg flex items-center justify-center gap-2'
                    >
                      <Plus size={20} />
                      Create New Listing
                    </Link>

                    <button
                      onClick={handleShowListings}
                      className='w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg flex items-center justify-center gap-2'
                    >
                      <Home size={20} />
                      Show My Properties
                    </button>
                  </div>
                </div>

                {/* Account Actions */}
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-6 rounded-2xl border border-rose-200">
                  <h3 className="text-xl font-semibold text-rose-800 mb-4 flex items-center">
                    <span className="mr-2">⚙️</span>
                    Account Actions
                  </h3>
                  
                  <div className="space-y-3">
                    <button
                      onClick={handleSignOut}
                      className='w-full bg-gray-500 text-white p-3 rounded-xl font-semibold hover:bg-gray-600 transition-all flex items-center justify-center gap-2'
                    >
                      <LogOut size={20} />
                      Sign Out
                    </button>

                    <button
                      onClick={handleDeleteUser}
                      className='w-full bg-red-500 text-white p-3 rounded-xl font-semibold hover:bg-red-600 transition-all flex items-center justify-center gap-2'
                    >
                      <Trash2 size={20} />
                      Delete Account
                    </button>
                  </div>
                </div>

                {/* User Stats */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-200">
                  <h3 className="text-xl font-semibold text-amber-800 mb-4 flex items-center">
                    <span className="mr-2">📊</span>
                    Your Stats
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-amber-700">Total Listings:</span>
                      <span className="font-bold text-amber-800">{userListings.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-amber-700">Member Since:</span>
                      <span className="font-bold text-amber-800">
                        {supabaseUser?.created_at ? new Date(supabaseUser.created_at).getFullYear() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {listingsLoading && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-blue-200 text-center mb-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              <p className="text-blue-600 text-lg">Loading your properties...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {showListingsError && (
          <div className="bg-red-50 border border-red-200 p-6 rounded-2xl mb-8">
            <p className='text-red-700'>❌ {showListingsError}</p>
          </div>
        )}

        {/* Listings Display */}
        {!listingsLoading && hasClickedShowListings && userListings.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-emerald-200">
            <h2 className='text-3xl font-bold text-gray-800 mb-6 flex items-center'>
              <Home className="mr-3 text-emerald-600" size={32} />
              My Properties ({userListings.length})
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userListings.map((listing) => (
                <div key={listing.id} className='bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 group'>
                  {/* Image */}
                  {listing.imageUrls && listing.imageUrls[0] && (
                    <img 
                      src={listing.imageUrls[0]} 
                      alt={listing.name || listing.title}
                      className="w-full h-48 object-cover rounded-xl mb-4 group-hover:scale-105 transition-transform"
                      onError={(e) => e.target.src = '/default-property.png'}
                    />
                  )}
                  
                  {/* Content */}
                  <div>
                    <h3 className="font-bold text-xl text-gray-800 mb-2">{listing.name || listing.title || 'Untitled'}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{listing.description || 'No description'}</p>
                    <p className="text-gray-500 text-sm mb-3 flex items-center">
                      <span className="mr-1">📍</span>
                      {listing.address}
                    </p>
                    
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-emerald-600 font-bold text-lg">
                        ₹{(listing.regularPrice || 0).toLocaleString()} 
                        {listing.type === 'rent' ? '/month' : ''}
                      </span>
                      <div className="text-sm text-gray-500">
                        {listing.bedrooms} bed • {listing.bathrooms} bath
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link
                        to={`/listing/${listing.id}`}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors text-center flex items-center justify-center gap-1"
                      >
                        <Eye size={16} />
                        View
                      </Link>
                      <Link
                        to={`/update-listing/${listing.id}`}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors text-center flex items-center justify-center gap-1"
                      >
                        <Edit size={16} />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteListing(listing.id)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Listings Message */}
        {!listingsLoading && hasClickedShowListings && userListings.length === 0 && showListingsError === '' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200 text-center">
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Properties Found</h3>
            <p className="text-gray-600 mb-6">You haven't created any listings yet. Start by creating your first property listing!</p>
            <Link 
              to="/create-listing" 
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Create Your First Listing
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

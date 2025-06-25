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
      <div className="p-3 max-w-lg mx-auto text-center">
        <h1 className="text-2xl font-semibold my-7">Profile</h1>
        <p className="text-red-700">You are not signed in. Please <Link to="/sign-in" className="underline text-blue-700">sign in</Link>.</p>
      </div>
    );
  }

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      
      {/* Profile Form */}
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input
          type='file'
          ref={fileRef}
          hidden
          accept='image/*'
          onChange={(e) => setFile(e.target.files[0])}
        />
        <img
          onClick={() => fileRef.current.click()}
          src={getAvatarUrl()}
          alt='profile'
          className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2'
          onError={(e) => (e.target.src = '/default-avatar.png')}
        />
        <p className='text-sm self-center'>
          {fileUploadError
            ? '❌ Image upload failed'
            : filePerc === 100
            ? '✅ Upload successful!'
            : filePerc > 0
            ? `Uploading ${filePerc}%`
            : ''}
        </p>

        <input
          type='text'
          placeholder='Username'
          id='username'
          value={formData.username}
          onChange={handleChange}
          className='border p-3 rounded-lg'
        />
        <input
          type='email'
          placeholder='Email'
          id='email'
          value={formData.email}
          onChange={handleChange}
          className='border p-3 rounded-lg'
        />
        <input
          type='password'
          placeholder='New Password'
          id='password'
          value={formData.password}
          onChange={handleChange}
          className='border p-3 rounded-lg'
        />

        <button
          disabled={loading}
          className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80'
        >
          {loading ? 'Updating...' : 'Update'}
        </button>

        <Link
          to='/create-listing'
          className='bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95'
        >
          Create Listing
        </Link>
      </form>

      {/* Action Buttons */}
      <div className='flex flex-col gap-2 mt-5'>
        <button
          onClick={handleShowListings}
          className='bg-blue-700 text-white p-2 rounded-lg uppercase hover:opacity-95'
        >
          Show My Listings
        </button>
        <span
          onClick={handleDeleteUser}
          className='text-red-700 cursor-pointer text-center'
        >
          Delete account
        </span>
        <span
          onClick={handleSignOut}
          className='text-red-700 cursor-pointer text-center'
        >
          Sign out
        </span>
      </div>

      {/* Messages */}
      {error && <p className='text-red-700 mt-5'>{error}</p>}
      {updateSuccess && <p className='text-green-700 mt-5'>✅ Profile updated!</p>}
      {showListingsError && <p className='text-red-700 mt-5'>{showListingsError}</p>}

      {/* Loading State */}
      {listingsLoading && (
        <div className="mt-8 p-4 bg-blue-50 rounded-lg text-center">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
            <p className="text-blue-600">Loading your listings...</p>
          </div>
        </div>
      )}

      {/* Listings Display at Bottom */}
      {!listingsLoading && hasClickedShowListings && userListings.length > 0 && (
        <div className='mt-8'>
          <h2 className='text-xl font-semibold mb-4'>My Listings ({userListings.length})</h2>
          <div className="space-y-4">
            {userListings.map((listing) => (
              <div key={listing.id} className='bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow'>
                <div className="flex gap-4">
                  {/* Image */}
                  {listing.imageUrls && listing.imageUrls[0] && (
                    <img 
                      src={listing.imageUrls[0]} 
                      alt={listing.name || listing.title}
                      className="w-20 h-20 object-cover rounded"
                      onError={(e) => e.target.src = '/default-property.png'}
                    />
                  )}
                  
                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{listing.name || listing.title || 'Untitled'}</h3>
                    <p className="text-gray-600 text-sm mb-2">{listing.description || 'No description'}</p>
                    <p className="text-gray-500 text-sm mb-2">{listing.address}</p>
                    
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-green-600 font-semibold">
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
                        to={`/update-listing/${listing.id}`}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteListing(listing.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Listings Message */}
      {!listingsLoading && hasClickedShowListings && userListings.length === 0 && showListingsError === '' && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600">No listings found.</p>
          <Link to="/create-listing" className="text-blue-600 underline">Create your first listing</Link>
        </div>
      )}
    </div>
  );
}

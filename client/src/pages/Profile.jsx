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
} from '../redux/user/userSlice';
import { Link } from 'react-router-dom';

export default function Profile() {
  const fileRef = useRef(null);
  const dispatch = useDispatch();
  const { currentUser, loading, error } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    avatar: '',
  });
  const [supabaseUser, setSupabaseUser] = useState(null);
  const [file, setFile] = useState(null);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // ✅ 1. Get Supabase user
  useEffect(() => {
    const fetchSupabaseUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) console.error('❌ Supabase auth error:', error.message);
      else setSupabaseUser(data.user);
    };
    fetchSupabaseUser();
  }, []);

  // ✅ 2. Set user data into form
  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || '',
        email: currentUser.email || '',
        avatar: currentUser.avatar || '',
      });
    } else if (supabaseUser) {
      setFormData({
        username: supabaseUser.user_metadata?.full_name || '',
        email: supabaseUser.email || '',
        avatar: supabaseUser.user_metadata?.avatar_url || '',
      });
    }
  }, [currentUser, supabaseUser]);

  // ✅ 3. Handle file upload
  useEffect(() => {
    if (!file) return;

    const upload = async () => {
      setFileUploadError(false);
      const fileName = `${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) return setFileUploadError(true);

      const { data: urlData } = await supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      if (!urlData?.publicUrl) return setFileUploadError(true);

      setFilePerc(100);
      const newAvatarUrl = urlData.publicUrl;
      setFormData((prev) => ({ ...prev, avatar: newAvatarUrl }));

      if (currentUser?._id) {
        const res = await fetch(`/api/user/update/${currentUser._id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ ...formData, avatar: newAvatarUrl }),
        });

        if (res.ok) {
          const updatedUser = await res.json();
          dispatch(updateUserSuccess(updatedUser));
        }
      }
    };

    upload();
  }, [file]);

  // ✅ 4. Handle input change
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  // ✅ 5. Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser?._id) return;
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (err) {
      dispatch(updateUserFailure(err.message));
    }
  };

  // ✅ 6. Delete user
  const handleDeleteUser = async () => {
    if (!currentUser?._id) return;
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (err) {
      dispatch(deleteUserFailure(err.message));
    }
  };

  // ✅ 7. Sign out
  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      await supabase.auth.signOut();
      const res = await fetch('/api/auth/signout', {
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (err) {
      dispatch(deleteUserFailure(err.message));
    }
  };

  // ✅ 8. Fallback for profile image
  const getAvatarUrl = () =>
    formData.avatar?.trim() ? formData.avatar : '/default-avatar.png';

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
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

      <div className='flex justify-between mt-5'>
        <span onClick={handleDeleteUser} className='text-red-700 cursor-pointer'>
          Delete account
        </span>
        <span onClick={handleSignOut} className='text-red-700 cursor-pointer'>
          Sign out
        </span>
      </div>

      {error && <p className='text-red-700 mt-5'>{error}</p>}
      {updateSuccess && <p className='text-green-700 mt-5'>✅ Profile updated!</p>}
    </div>
  );
}

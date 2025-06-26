import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { signInStart, signInSuccess, signInFailure } from '../redux/user/userSlice';
import { useSelector } from 'react-redux';
import { Mail, Lock, LogIn, Home } from 'lucide-react';
import OAuth from '../components/OAuth';

export default function Signin() {
  const [formData, setFormData] = useState({});
  const { loading, error } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(signInStart());
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const rawText = await res.text();
      console.log('🔍 RAW RESPONSE TEXT:', rawText);

      let data;
      try {
        data = JSON.parse(rawText);
      } catch (err) {
        throw new Error('Invalid JSON returned from server');
      }
      if (data.success === false) {
        dispatch(signInFailure(data.message));
        return;
      }
      dispatch(signInSuccess(data));
      navigate('/');
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center px-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl max-w-sm w-full p-6 border border-emerald-100">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-3 rounded-xl w-fit mx-auto mb-3">
            <Home className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Welcome Back</h1>
          <p className="text-gray-600 text-sm">Sign in to Home Connect</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Email Input */}
          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500" size={18} />
              <input
                type='email'
                placeholder='Email address'
                className='w-full pl-11 pr-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all bg-white/70'
                id='email'
                value={formData.email || ''}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500" size={18} />
              <input
                type='password'
                placeholder='Password'
                className='w-full pl-11 pr-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all bg-white/70'
                id='password'
                value={formData.password || ''}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Sign In Button */}
          <button
            disabled={loading}
            className='w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-2'
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Signing In...
              </>
            ) : (
              <>
                <LogIn size={18} />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* OAuth Section */}
        <div className="my-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500">Or</span>
            </div>
          </div>
        </div>

        {/* Centered Google OAuth with matching colors */}
        <div className="flex justify-center">
          <OAuth />
        </div>

        {/* Sign Up Link */}
        <div className='text-center text-gray-600 mt-4'>
          <p className="text-sm">
            Don't have an account?{' '}
            <Link to={'/sign-up'} className='text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-colors'>
              Sign up
            </Link>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 p-3 rounded-xl">
            <p className='text-red-700 text-center text-sm'>❌ {error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

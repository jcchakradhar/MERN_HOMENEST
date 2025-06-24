import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';

export default function AuthCallback() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const syncSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // Save user info to Redux
        dispatch(signInSuccess({
          email: session.user.email,
          avatar: session.user.user_metadata.avatar_url,
          username: session.user.user_metadata.full_name,
        }));

        navigate('/profile');
      }
    };

    syncSession();
  }, []);

  return <p className="text-center mt-10">Signing in...</p>;
}

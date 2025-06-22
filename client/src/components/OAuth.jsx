import React from 'react'
import {GoogleAuthProvider,getAuth, signInWithPopup} from 'firebase/auth';
import {app} from '../firebase';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
export default function OAuth() {
  const dispatch = useDispatch(); // ✅ FIXED
  const navigate=useNavigate();
    const handleGoogleClick=async()=>{
        try{
            const provider=new GoogleAuthProvider();
            const auth=getAuth(app)
            const result=await signInWithPopup(auth,provider);
           // console.log(result);
           console.log('📥 Google User Info:', result.user);
           const res=await fetch('/api/auth/google',{
            method:'POST',
            headers:{
              'content-type':'application/json',
            },
            body:JSON.stringify({
              name:result.user.displayName,
              email:result.user.email,
              photo:result.user.photoURL,
            }),
           })
           const data=await res.json();
           dispatch(signInSuccess(data));
           navigate('/');
             
        }catch(error){
            console.log('could not connect with google',error);
        }
    }

  return (
    <button onClick={handleGoogleClick}type='button'className='bg-red-700 text-white p-3 rounded-lg uppercase hover:opacity-90'>
      Continue with google
    </button>
  )
}
//When the user clicks the button, it triggers this function.

//It shows the Google sign-in popup.

//If successful, result.user will contain the logged-in user's info (name, email, etc.)

//If it fails, it logs an error to the console.

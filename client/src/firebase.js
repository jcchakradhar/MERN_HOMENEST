// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-766ca.firebaseapp.com",
  projectId: "mern-estate-766ca",
  storageBucket: "mern-estate-766ca.firebasestorage.app",
  messagingSenderId: "874758680845",
  appId: "1:874758680845:web:bbf967f1ba4944ef2e0044"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
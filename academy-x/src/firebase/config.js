import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration, read from environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

apiKey: "AIzaSyCHakQ1cdA7ANXD9pLoF8BaPihZHBKV5A4",
  authDomain: "landge-web.firebaseapp.com",
  projectId: "landge-web",
  storageBucket: "landge-web.firebasestorage.app",
  messagingSenderId: "922108311409",
  appId: "1:922108311409:web:a78d01906db579f23fe8d0",
  measurementId: "G-ZKHY6B3GNZ"
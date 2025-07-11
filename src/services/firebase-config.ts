import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyANFOOgSGPLhyzri5jaPOYmAv-CeGIv4zs",
  authDomain: "daily-flame.firebaseapp.com",
  projectId: "daily-flame",
  storageBucket: "daily-flame.firebasestorage.app",
  messagingSenderId: "129859451154",
  appId: "1:129859451154:web:583759894f1ce471b35bcb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
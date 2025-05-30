import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB6Ron2_k7ieiAWOuqtJXNulr-vIKC5EZU",
  authDomain: "sayit-6be8a.firebaseapp.com",
  projectId: "sayit-6be8a",
  storageBucket: "sayit-6be8a.appspot.com",
  messagingSenderId: "515191110868",
  appId: "1:515191110868:ios:28491b88857804e7e6cf41"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

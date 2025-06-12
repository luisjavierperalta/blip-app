import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getAnalytics } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAg6SwC5kbj1ysZojQ4TMnjV4g4p0knLxY",
  authDomain: "blip-cc1f9.firebaseapp.com",
  projectId: "blip-cc1f9",
  storageBucket: "blip-cc1f9.appspot.com",
  messagingSenderId: "315439687670",
  appId: "1:315439687670:web:81831e4b709083483789d7",
  measurementId: "G-8L0V3V46KV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const analytics = getAnalytics(app);
export const storage = getStorage(app);
export const database = getDatabase(app);

export default app; 
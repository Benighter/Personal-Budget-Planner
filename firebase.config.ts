import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const fallbackFirebaseConfig = {
  apiKey: "AIzaSyAS8awD9mOr1qR5s2goXDvoPQfgM_VBpDI",
  authDomain: "personal-budget-planner-581d6.firebaseapp.com",
  projectId: "personal-budget-planner-581d6",
  storageBucket: "personal-budget-planner-581d6.appspot.com",
  messagingSenderId: "790321408904",
  appId: "1:790321408904:web:465297f0879cf4443c283d",
  measurementId: "G-5321XQ5XTW",
} as const;

const requiredEnvKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

const missingEnvKeys = requiredEnvKeys.filter((key) => !import.meta.env[key]);

if (missingEnvKeys.length > 0) {
  console.warn(
    `Missing Firebase environment variables: ${missingEnvKeys.join(', ')}. Falling back to the checked-in Firebase web config.`
  );
}

const rawStorageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || fallbackFirebaseConfig.storageBucket;
const normalizedStorageBucket = rawStorageBucket.endsWith('.firebasestorage.app')
  ? rawStorageBucket.replace(/\.firebasestorage\.app$/, '.appspot.com')
  : rawStorageBucket;

if (rawStorageBucket !== normalizedStorageBucket) {
  console.warn(
    `Normalized Firebase Storage bucket from ${rawStorageBucket} to ${normalizedStorageBucket} for web SDK compatibility.`
  );
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || fallbackFirebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || fallbackFirebaseConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || fallbackFirebaseConfig.projectId,
  storageBucket: normalizedStorageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || fallbackFirebaseConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || fallbackFirebaseConfig.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || fallbackFirebaseConfig.measurementId,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const storage = getStorage(app, `gs://${firebaseConfig.storageBucket}`);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;

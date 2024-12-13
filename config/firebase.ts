import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";

export const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
export const AUTH_DOMAIN = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
export const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
export const STORAGE_BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
export const MESSAGING_SENDER_ID =
  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
export const APP_ID = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
export const MEASUREMENT_ID = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

if (
  !API_KEY ||
  !AUTH_DOMAIN ||
  !PROJECT_ID ||
  !STORAGE_BUCKET ||
  !MESSAGING_SENDER_ID ||
  !APP_ID ||
  !MEASUREMENT_ID
) {
  throw new Error("Missing firebase config values");
}

const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
  messagingSenderId: MESSAGING_SENDER_ID,
  appId: APP_ID,
  measurementId: MEASUREMENT_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
// export const analytics = getAnalytics(app);

// Analytics initialization only on the client-side
let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch((err) => {
      console.error("Firebase Analytics initialization failed:", err);
    });
}

export { auth, analytics };

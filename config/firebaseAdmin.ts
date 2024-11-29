import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

export const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
export const CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
export const PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY?.replace(
  /\\n/g,
  "\n"
);

const adminConfig = {
  credential: cert({
    projectId: PROJECT_ID,
    clientEmail: CLIENT_EMAIL,
    privateKey: PRIVATE_KEY,
  }),
};

const adminApp = !getApps().length ? initializeApp(adminConfig) : getApps()[0];

export const adminAuth = getAuth(adminApp);

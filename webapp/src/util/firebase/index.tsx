import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
};
const region = process.env.NEXT_PUBLIC_FIREBASE_REGION;
// Initialize (or reuse) the app
const firebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApps()[0];
console.log("Firebase app initialized:", firebaseApp.name);

// Analytics (silently skip if unsupported, e.g. SSR)
isSupported()
  .then((supported) => {
    if (supported) getAnalytics(firebaseApp);
  })
  .catch((err) => {});

// Initialize Firebase services
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);
const functions = region
  ? getFunctions(firebaseApp, region)
  : getFunctions(firebaseApp);

export { firebaseApp, auth, db, functions, storage };

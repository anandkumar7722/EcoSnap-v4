
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getDatabase, type Database } from 'firebase/database';
import { getAnalytics, type Analytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// It's best practice to store these in environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let database: Database;
let analytics: Analytics | undefined;

if (typeof window !== 'undefined') { // Ensure Firebase is initialized only on the client-side for certain services
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }

  auth = getAuth(app);
  firestore = getFirestore(app);
  database = getDatabase(app);
  
  // Initialize Analytics only on the client side and if measurementId is present
  if (firebaseConfig.measurementId) {
    analytics = getAnalytics(app);
  }
} else {
  // Server-side initialization (can be more limited if only certain services are needed server-side)
  // For now, we'll ensure 'app' is initialized for potential server-side use of Firestore/Auth admin actions (though this client SDK is not for admin)
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app); // Can be initialized, but most operations are client-side
  firestore = getFirestore(app); // Can be initialized for server-side data access if needed (e.g. in API routes)
  database = getDatabase(app); // Same as Firestore
}


export { app, auth, firestore, database, analytics };

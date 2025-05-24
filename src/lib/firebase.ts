
// Log environment variables at the very top of this module's execution
// This helps debug issues specifically during `next build` in Docker.
console.log("Build-time Firebase Config Check (src/lib/firebase.ts):");
console.log(`NEXT_PUBLIC_FIREBASE_API_KEY: ${process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'SET' : 'NOT SET'}`);
console.log(`NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'SET' : 'NOT SET'}`);
console.log(`NEXT_PUBLIC_FIREBASE_DATABASE_URL: ${process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ? 'SET' : 'NOT SET'}`);
console.log(`NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'SET' : 'NOT SET'}`);
console.log(`NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'SET' : 'NOT SET'}`);
console.log(`NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'SET' : 'NOT SET'}`);
console.log(`NEXT_PUBLIC_FIREBASE_APP_ID: ${process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'SET' : 'NOT SET'}`);
console.log(`NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: ${process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ? 'SET' : 'NOT SET'}`);
console.log("---------------------------------------------------------");


import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getDatabase, type Database } from 'firebase/database';
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics"; // Import isSupported

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// It's best practice to store these in environment variables

const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

let criticalError = false;
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    console.error(`CRITICAL Firebase Config Error: Environment variable ${varName} is missing or undefined.`);
    criticalError = true;
  }
}

if (criticalError) {
  console.error("CRITICAL Firebase Error: One or more required Firebase config keys are missing or undefined.");
  console.error("Values received by firebase.ts:");
  console.error(`apiKey: ${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`);
  console.error(`authDomain: ${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}`);
  console.error(`databaseURL: ${process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL}`);
  console.error(`projectId: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);
  console.error(`storageBucket: ${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}`);
  console.error(`messagingSenderId: ${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}`);
  console.error(`appId: ${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}`);
  console.error(`measurementId: ${process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID}`);
  // To prevent the app from fully crashing during build if keys are missing but still allow build to proceed for other parts:
  // throw new Error("Firebase configuration is incomplete. Check build logs and environment variables.");
}


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
let analytics: Analytics | undefined; // Keep as potentially undefined

// Ensure Firebase is initialized only on the client-side for Analytics
// Other services like Auth, Firestore, Database can be initialized more broadly
// but their usage might still be client-dependent for most features.

if (getApps().length === 0) {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error("Firebase apiKey or projectId is missing. Firebase App initialization skipped during build or server-side.");
    // Avoid throwing error here to let build potentially continue for non-Firebase parts
    // Instead, services will be undefined and operations will fail gracefully or be caught later.
    app = {} as FirebaseApp; // Dummy app to prevent further errors if not initialized
  } else {
    app = initializeApp(firebaseConfig);
  }
} else {
  app = getApp();
}

// Initialize services, they might fail if 'app' is a dummy object
// but this structure allows the build to attempt to proceed further.
try {
  auth = getAuth(app);
  firestore = getFirestore(app);
  database = getDatabase(app);
} catch (e) {
  console.error("Failed to initialize core Firebase services (Auth, Firestore, Database). Config issue?", e);
  // Assign dummy objects or handle appropriately if critical
  auth = {} as Auth;
  firestore = {} as Firestore;
  database = {} as Database;
}


if (typeof window !== 'undefined') {
  // Initialize Analytics only on the client side and if supported & measurementId is present
  isSupported().then(supported => {
    if (supported && firebaseConfig.measurementId && app && Object.keys(app).length > 0 && app.name) {
      try {
        analytics = getAnalytics(app);
      } catch (e) {
        console.error("Failed to initialize Firebase Analytics:", e);
      }
    } else {
      if (!supported) console.log("Firebase Analytics is not supported in this environment.");
      if (!firebaseConfig.measurementId) console.log("Firebase Analytics measurementId is missing.");
      if (!app || Object.keys(app).length === 0 || !app.name) console.log("Firebase App not properly initialized for Analytics.");
    }
  }).catch(e => {
    console.error("Error checking Firebase Analytics support:", e);
  });
}


export { app, auth, firestore, database, analytics };

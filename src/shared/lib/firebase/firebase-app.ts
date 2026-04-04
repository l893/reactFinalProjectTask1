import { initializeApp, type FirebaseApp } from 'firebase/app';

let firebaseApp: FirebaseApp | null = null;

function requireEnv(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(
      `[Firebase] Missing environment variable: ${name}. Check your .env file.`,
    );
  }
  return value;
}

export function getFirebaseApp(): FirebaseApp {
  if (firebaseApp) return firebaseApp;

  firebaseApp = initializeApp({
    apiKey: requireEnv('VITE_FIREBASE_API_KEY'),
    authDomain: requireEnv('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: requireEnv('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: requireEnv('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: requireEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: requireEnv('VITE_FIREBASE_APP_ID'),
  });

  return firebaseApp;
}

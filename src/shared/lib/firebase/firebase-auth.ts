import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';

import { getFirebaseApp } from './firebase-app';

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

export function subscribeToAuthState(
  onUserChange: (user: User | null) => void,
): () => void {
  return onAuthStateChanged(getFirebaseAuth(), onUserChange);
}

export async function signInWithEmail(credentials: {
  email: string;
  password: string;
}): Promise<void> {
  await signInWithEmailAndPassword(
    getFirebaseAuth(),
    credentials.email,
    credentials.password,
  );
}

export async function signOutFromFirebase(): Promise<void> {
  await signOut(getFirebaseAuth());
}

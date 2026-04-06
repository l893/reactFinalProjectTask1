import {
  enableIndexedDbPersistence,
  getFirestore,
  type Firestore,
} from 'firebase/firestore';

import { getFirebaseApp } from './firebase-app';

let firestoreInstance: Firestore | null = null;
let isPersistenceRequested = false;

export function getFirebaseFirestore(): Firestore {
  if (firestoreInstance) return firestoreInstance;
  firestoreInstance = getFirestore(getFirebaseApp());
  return firestoreInstance;
}

export async function enableFirestorePersistence(): Promise<void> {
  if (isPersistenceRequested) return;
  isPersistenceRequested = true;

  try {
    await enableIndexedDbPersistence(getFirebaseFirestore());
  } catch (unknownError) {
    const message =
      unknownError instanceof Error
        ? unknownError.message
        : String(unknownError);
    console.warn('[Firestore] Persistence was not enabled:', message);
  }
}

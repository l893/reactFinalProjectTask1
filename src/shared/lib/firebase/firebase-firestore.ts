import {
  disableNetwork,
  enableNetwork,
  enableIndexedDbPersistence,
  getFirestore,
  setLogLevel,
  type Firestore,
} from 'firebase/firestore';

import { getFirebaseApp } from './firebase-app';

let firestoreInstance: Firestore | null = null;
let isPersistenceRequested = false;
let isFirestoreNetworkEnabled: boolean | null = null;

export function getFirebaseFirestore(): Firestore {
  if (firestoreInstance) return firestoreInstance;
  firestoreInstance = getFirestore(getFirebaseApp());

  setLogLevel('error');

  return firestoreInstance;
}

export async function setFirestoreNetworkEnabled(
  isEnabled: boolean,
): Promise<void> {
  if (isFirestoreNetworkEnabled === isEnabled) return;
  isFirestoreNetworkEnabled = isEnabled;

  try {
    if (isEnabled) {
      await enableNetwork(getFirebaseFirestore());
    } else {
      await disableNetwork(getFirebaseFirestore());
    }
  } catch (error) {
    console.warn('[Firestore] Network toggle failed:', error);
  }
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

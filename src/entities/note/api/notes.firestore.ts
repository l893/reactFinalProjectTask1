import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';

import { getFirebaseFirestore } from '@shared/lib/firebase/firebase-firestore';
import type { Note } from '../model/note.types';

interface NoteDocument {
  title?: unknown;
  body?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
}

function notesCollection(userId: string) {
  return collection(getFirebaseFirestore(), 'users', userId, 'notes');
}

function normalizeTitle(title: string): string {
  const normalizedTitle = title.trim();
  if (!normalizedTitle) return 'New note';
  return normalizedTitle.length > 80
    ? `${normalizedTitle.slice(0, 80)}…`
    : normalizedTitle;
}

export function subscribeToUserNotes(
  userId: string,
  onNotes: (notes: Note[]) => void,
): () => void {
  const notesQuery = query(
    notesCollection(userId),
    orderBy('updatedAt', 'desc'),
  );

  return onSnapshot(notesQuery, (snapshot) => {
    const notes: Note[] = snapshot.docs.map((documentSnapshot) => {
      const data = documentSnapshot.data() as NoteDocument;

      const createdAt =
        typeof data.createdAt === 'number' ? data.createdAt : Date.now();
      const updatedAt =
        typeof data.updatedAt === 'number' ? data.updatedAt : createdAt;

      return {
        id: documentSnapshot.id,
        title:
          typeof data.title === 'string' && data.title.trim()
            ? data.title
            : 'New note',
        body: typeof data.body === 'string' ? data.body : '',
        createdAt,
        updatedAt,
      };
    });

    onNotes(notes);
  });
}

export async function createUserNote(userId: string): Promise<string> {
  const now = Date.now();

  const docRef = await addDoc(notesCollection(userId), {
    title: 'New note',
    body: '',
    createdAt: now,
    updatedAt: now,
  } satisfies NoteDocument);

  return docRef.id;
}

export async function updateUserNoteBody(
  userId: string,
  noteId: string,
  body: string,
): Promise<void> {
  await updateDoc(doc(notesCollection(userId), noteId), {
    body,
  } satisfies Partial<NoteDocument>);
}

export async function updateUserNoteTitle(
  userId: string,
  noteId: string,
  title: string,
): Promise<void> {
  await updateDoc(doc(notesCollection(userId), noteId), {
    title: normalizeTitle(title),
  } satisfies Partial<NoteDocument>);
}

export async function confirmUserNoteBody(
  userId: string,
  noteId: string,
  body: string,
  updatedAt: number,
): Promise<void> {
  await updateDoc(doc(notesCollection(userId), noteId), {
    body,
    updatedAt,
  } satisfies Partial<NoteDocument>);
}

export async function confirmUserNoteTitle(
  userId: string,
  noteId: string,
  title: string,
  updatedAt: number,
): Promise<void> {
  await updateDoc(doc(notesCollection(userId), noteId), {
    title: normalizeTitle(title),
    updatedAt,
  } satisfies Partial<NoteDocument>);
}

export async function deleteUserNote(
  userId: string,
  noteId: string,
): Promise<void> {
  await deleteDoc(doc(notesCollection(userId), noteId));
}

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
  title: string;
  body: string;
  createdAt: number;
  updatedAt: number;
}

function notesCollection(userId: string) {
  return collection(getFirebaseFirestore(), 'users', userId, 'notes');
}

function deriveTitleFromBody(body: string): string {
  const firstNonEmptyLine =
    body
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line.length > 0) ?? '';

  const title = firstNonEmptyLine || 'New note';
  return title.length > 40 ? `${title.slice(0, 40)}…` : title;
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
      return {
        id: documentSnapshot.id,
        title: data.title,
        body: data.body,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
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
  const now = Date.now();

  await updateDoc(doc(notesCollection(userId), noteId), {
    body,
    title: deriveTitleFromBody(body),
    updatedAt: now,
  } satisfies Partial<NoteDocument>);
}

export async function deleteUserNote(
  userId: string,
  noteId: string,
): Promise<void> {
  await deleteDoc(doc(notesCollection(userId), noteId));
}

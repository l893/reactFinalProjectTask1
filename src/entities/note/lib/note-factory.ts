import type { Note } from '../model/note.types';

function createNoteId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return String(Date.now());
}

export function createEmptyNote(): Note {
  const now = Date.now();

  return {
    id: createNoteId(),
    title: 'New note',
    body: '',
    createdAt: now,
    updatedAt: now,
  };
}

export function createSeedNotes(): Note[] {
  const now = Date.now();

  return [
    {
      id: 'welcome',
      title: 'Welcome',
      body: 'This is your first note.',
      createdAt: now - 1000 * 60 * 60,
      updatedAt: now - 1000 * 60 * 10,
    },
  ];
}

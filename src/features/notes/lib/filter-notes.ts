import type { Note } from '@entities/note/model/note.types';

export function filterNotes(notes: Note[], searchQuery: string): Note[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  if (!normalizedQuery) return notes;

  return notes.filter((note) => {
    const title = (note.title ?? '').toLowerCase();
    const body = (note.body ?? '').toLowerCase();
    return title.includes(normalizedQuery) || body.includes(normalizedQuery);
  });
}

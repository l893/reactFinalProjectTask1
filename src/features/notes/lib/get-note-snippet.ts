import type { Note } from '@entities/note/model/note.types';

export function getNoteSnippet(note: Note): string {
  const trimmedBody = (note.body ?? '').trim();
  if (!trimmedBody) return 'No additional text';

  const singleLineBody = trimmedBody.replace(/\s+/g, ' ');
  return singleLineBody.length > 60
    ? `${singleLineBody.slice(0, 60)}…`
    : singleLineBody;
}

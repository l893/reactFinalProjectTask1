import { List, ListItemButton, ListItemText } from '@mui/material';

import { useNotesActions, useNotesState } from '@features/notes';
import type { Note } from '@entities/note/model/note.types';
import { formatNoteTimestampForList } from '@entities/note/lib/note-date';

import styles from './notes-sidebar.module.scss';

function filterNotes(notes: Note[], searchQuery: string): Note[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  if (!normalizedQuery) return notes;

  return notes.filter((note) => {
    const title = note.title.toLowerCase();
    const body = note.body.toLowerCase();
    return title.includes(normalizedQuery) || body.includes(normalizedQuery);
  });
}

export const NotesSidebar = (): React.JSX.Element => {
  const { notes, selectedNoteId, searchQuery } = useNotesState();
  const { selectNote } = useNotesActions();
  const visibleNotes = filterNotes(notes, searchQuery);

  function handleNoteClick(noteId: string): void {
    selectNote(noteId);
  }

  function getNoteSnippet(note: Note): string {
    const trimmedBody = note.body.trim();
    if (!trimmedBody) return 'No additional text';
    const singleLine = trimmedBody.replace(/\s+/g, ' ');
    return singleLine.length > 60 ? `${singleLine.slice(0, 60)}…` : singleLine;
  }

  return (
    <div className={styles.root}>
      <div className={styles.list}>
        <List disablePadding>
          {visibleNotes.map((note) => (
            <ListItemButton
              key={note.id}
              selected={note.id === selectedNoteId}
              onClick={() => handleNoteClick(note.id)}
            >
              <ListItemText
                primary={note.title}
                secondary={
                  <span className={styles.secondaryRow}>
                    <span className={styles.noteDate}>
                      {formatNoteTimestampForList(note.updatedAt)}
                    </span>
                    <span className={styles.noteSnippet}>
                      {getNoteSnippet(note)}
                    </span>
                  </span>
                }
              />
            </ListItemButton>
          ))}
        </List>
      </div>
    </div>
  );
};

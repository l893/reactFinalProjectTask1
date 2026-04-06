import { List, ListItemButton, ListItemText } from '@mui/material';

import { useNotesActions, useNotesState } from '@features/notes';
import type { Note } from '@entities/note/model/note.types';

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
                secondary={note.body ? note.body.slice(0, 60) : 'Empty note'}
              />
            </ListItemButton>
          ))}
        </List>
      </div>
    </div>
  );
};

import { List, ListItemButton, ListItemText } from '@mui/material';

import { useNotesActions, useNotesState } from '@features/notes';
import { formatNoteTimestampForList } from '@entities/note/lib/note-date';
import { filterNotes, getNoteSnippet } from '@features/notes/lib';

import styles from './notes-sidebar.module.scss';

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

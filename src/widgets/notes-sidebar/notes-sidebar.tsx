import { Add as AddIcon, LogoutOutlined } from '@mui/icons-material';
import {
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  TextField,
} from '@mui/material';

import { useNotesActions, useNotesState } from '@features/notes';
import { useAuthActions } from '@features/auth';
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

interface NotesSidebarProps {
  searchInputElementRef: React.RefObject<HTMLInputElement | null>;
}

export const NotesSidebar = ({
  searchInputElementRef,
}: NotesSidebarProps): React.JSX.Element => {
  const { notes, selectedNoteId, searchQuery } = useNotesState();
  const { createNote, selectNote, setSearchQuery } = useNotesActions();
  const authActions = useAuthActions();
  const visibleNotes = filterNotes(notes, searchQuery);

  function handleSearchChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    setSearchQuery(event.target.value);
  }

  function handleCreateNoteClick(): void {
    createNote();
  }

  function handleLogoutClick(): void {
    void authActions.signOut();
  }

  function handleNoteClick(noteId: string): void {
    selectNote(noteId);
  }

  return (
    <div className={styles.root}>
      <div className={styles.topBar}>
        <TextField
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search notes"
          inputRef={searchInputElementRef}
        />
        <IconButton aria-label="Create note" onClick={handleCreateNoteClick}>
          <AddIcon />
        </IconButton>
        <IconButton aria-label="Log out" onClick={handleLogoutClick}>
          <LogoutOutlined />
        </IconButton>
      </div>

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

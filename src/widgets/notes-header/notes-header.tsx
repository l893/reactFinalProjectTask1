import {
  Add as AddIcon,
  CheckOutlined,
  DeleteOutline,
  EditOutlined,
  LogoutOutlined,
} from '@mui/icons-material';
import { IconButton, TextField, Tooltip } from '@mui/material';

import styles from './notes-header.module.scss';

interface NotesHeaderProps {
  searchQuery: string;
  searchInputElementRef: React.RefObject<HTMLInputElement | null>;
  isNoteSelected: boolean;
  isEditingBody: boolean;
  onSearchQueryChange: (searchQuery: string) => void;
  onCreateNote: () => void;
  onToggleEditBody: () => void;
  onRequestDeleteNote: () => void;
  onLogout: () => void;
}

export const NotesHeader = (props: NotesHeaderProps): React.JSX.Element => {
  const {
    searchQuery,
    searchInputElementRef,
    isNoteSelected,
    isEditingBody,
    onSearchQueryChange,
    onCreateNote,
    onToggleEditBody,
    onRequestDeleteNote,
    onLogout,
  } = props;

  function handleSearchChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    onSearchQueryChange(event.target.value);
  }

  return (
    <div className={styles.header}>
      <div className={styles.left}>
        <TextField
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search notes"
          inputRef={searchInputElementRef}
          fullWidth
        />
      </div>

      <div className={styles.center}>
        <Tooltip title="Create note">
          <IconButton aria-label="Create note" onClick={onCreateNote}>
            <AddIcon />
          </IconButton>
        </Tooltip>

        <Tooltip
          title={isEditingBody ? 'Finish editing text' : 'Edit note text'}
        >
          <span>
            <IconButton
              aria-label={
                isEditingBody ? 'Finish editing text' : 'Edit note text'
              }
              onClick={onToggleEditBody}
              disabled={!isNoteSelected}
            >
              {isEditingBody ? <CheckOutlined /> : <EditOutlined />}
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Delete note">
          <span>
            <IconButton
              aria-label="Delete note"
              onClick={onRequestDeleteNote}
              disabled={!isNoteSelected}
            >
              <DeleteOutline />
            </IconButton>
          </span>
        </Tooltip>
      </div>

      <div className={styles.right}>
        <Tooltip title="Log out">
          <IconButton aria-label="Log out" onClick={onLogout}>
            <LogoutOutlined />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
};

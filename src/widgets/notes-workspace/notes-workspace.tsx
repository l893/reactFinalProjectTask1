import { Box, TextField, Typography } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import type { Note } from '@entities/note/model/note.types';
import { formatNoteTimestampForWorkspace } from '@entities/note/lib/note-date';

import styles from './notes-workspace.module.scss';

interface NotesWorkspaceProps {
  selectedNote: Note | null;
  isEditingBody: boolean;
  draftBody: string;
  onDraftBodyChange: (body: string) => void;
  isEditingTitle: boolean;
  draftTitle: string;
  onDraftTitleChange: (title: string) => void;
}

export const NotesWorkspace = (
  props: NotesWorkspaceProps,
): React.JSX.Element => {
  const {
    selectedNote,
    isEditingBody,
    draftBody,
    onDraftBodyChange,
    isEditingTitle,
    draftTitle,
    onDraftTitleChange,
  } = props;

  const selectedNoteBody = selectedNote?.body ?? '';

  function handleDraftChange(event: React.ChangeEvent<HTMLInputElement>): void {
    onDraftBodyChange(event.target.value);
  }

  function handleDraftTitleChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    onDraftTitleChange(event.target.value);
  }

  if (!selectedNote) {
    return (
      <Box className={styles.root}>
        <Typography variant="body1">Select a note</Typography>
      </Box>
    );
  }

  return (
    <Box className={styles.root}>
      <div className={styles.content}>
        <Typography className={styles.dateRow} variant="body2">
          {formatNoteTimestampForWorkspace(selectedNote.updatedAt)}
        </Typography>

        {isEditingTitle ? (
          <TextField
            value={draftTitle}
            onChange={handleDraftTitleChange}
            placeholder="Note title"
            fullWidth
            size="small"
          />
        ) : (
          <Typography variant="h4" component="h1">
            {selectedNote.title}
          </Typography>
        )}

        {isEditingBody ? (
          <TextField
            value={draftBody}
            onChange={handleDraftChange}
            placeholder="Start writing..."
            fullWidth
            multiline
            minRows={16}
          />
        ) : selectedNoteBody ? (
          <Box className={styles.markdown}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {selectedNoteBody}
            </ReactMarkdown>
          </Box>
        ) : (
          <Typography variant="body1">Empty note</Typography>
        )}
      </div>
    </Box>
  );
};

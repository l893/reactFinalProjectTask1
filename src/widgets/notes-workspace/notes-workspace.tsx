import { useEffect, useState } from 'react';
import {
  CheckOutlined,
  DeleteOutline,
  EditOutlined,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { useNotesActions, useNotesState } from '@features/notes';
import { useDebouncedValue } from '@shared/hooks/use-debounced-value';
import { useHotkeys } from '@shared/hooks/use-hotkeys';

import styles from './notes-workspace.module.scss';

export const NotesWorkspace = (): React.JSX.Element => {
  const { notes, selectedNoteId } = useNotesState();
  const { deleteNote, selectNote, updateNoteBody } = useNotesActions();

  const selectedNote = notes.find((note) => note.id === selectedNoteId) ?? null;

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [draftBody, setDraftBody] = useState<string>('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isSavePromptDialogOpen, setIsSavePromptDialogOpen] =
    useState<boolean>(false);
  const [pendingSelectedNoteId, setPendingSelectedNoteId] = useState<
    string | null
  >(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingOriginalBody, setEditingOriginalBody] = useState<string>('');

  const selectedNoteBody = selectedNote?.body ?? '';
  const debouncedDraftBody = useDebouncedValue(draftBody, 600);

  function startEditingSelectedNote(): void {
    if (!selectedNote) return;
    setEditingNoteId(selectedNote.id);
    setEditingOriginalBody(selectedNote.body);
    setDraftBody(selectedNote.body);
    setIsEditing(true);
  }

  function stopEditingSelectedNote(): void {
    setIsEditing(false);
    setEditingNoteId(null);
    setEditingOriginalBody('');
    setDraftBody('');
  }

  function confirmDeleteSelectedNote(): void {
    if (!selectedNote) return;
    deleteNote(selectedNote.id);
    setIsDeleteDialogOpen(false);
    setIsSavePromptDialogOpen(false);
    setPendingSelectedNoteId(null);
    stopEditingSelectedNote();
  }

  function proceedToPendingNote(): void {
    if (!pendingSelectedNoteId) return;
    selectNote(pendingSelectedNoteId);
    setPendingSelectedNoteId(null);
  }

  function handleSavePromptYes(): void {
    if (!editingNoteId) return;
    updateNoteBody(editingNoteId, draftBody);
    setIsSavePromptDialogOpen(false);
    stopEditingSelectedNote();
    proceedToPendingNote();
  }

  function handleSavePromptNo(): void {
    if (!editingNoteId) return;
    updateNoteBody(editingNoteId, editingOriginalBody);
    setIsSavePromptDialogOpen(false);
    stopEditingSelectedNote();
    proceedToPendingNote();
  }

  function handleSavePromptClose(): void {
    setIsSavePromptDialogOpen(false);
    setPendingSelectedNoteId(null);
  }

  useHotkeys([
    {
      key: 'escape',
      handler: () => {
        if (isDeleteDialogOpen) {
          setIsDeleteDialogOpen(false);
          return;
        }

        if (isSavePromptDialogOpen) {
          handleSavePromptClose();
          return;
        }

        if (isEditing) {
          if (editingNoteId) {
            updateNoteBody(editingNoteId, draftBody);
          }
          stopEditingSelectedNote();
        }
      },
    },
  ]);

  useEffect(() => {
    setIsDeleteDialogOpen(false);
  }, [selectedNoteId]);

  useEffect(() => {
    if (!isEditing) return;
    if (!editingNoteId) return;
    if (!selectedNoteId) return;
    if (selectedNoteId === editingNoteId) return;

    const hasUnsavedDraft =
      isEditing && editingNoteId !== null && draftBody !== editingOriginalBody;

    if (hasUnsavedDraft) {
      setPendingSelectedNoteId(selectedNoteId);
      setIsSavePromptDialogOpen(true);
      selectNote(editingNoteId);
      return;
    }

    stopEditingSelectedNote();
  }, [
    selectedNoteId,
    isEditing,
    editingNoteId,
    selectNote,
    draftBody,
    editingOriginalBody,
  ]);

  useEffect(() => {
    if (!isEditing) return;
    if (!editingNoteId) return;
    if (isSavePromptDialogOpen) return;
    if (selectedNoteId !== editingNoteId) return;
    if (debouncedDraftBody === selectedNoteBody) return;
    updateNoteBody(editingNoteId, debouncedDraftBody);
  }, [
    debouncedDraftBody,
    isEditing,
    editingNoteId,
    isSavePromptDialogOpen,
    selectedNoteBody,
    selectedNoteId,
    updateNoteBody,
  ]);

  function handleToggleEditClick(
    event: React.MouseEvent<HTMLButtonElement>,
  ): void {
    event.preventDefault();
    if (isEditing) {
      if (editingNoteId) {
        updateNoteBody(editingNoteId, draftBody);
      }
      stopEditingSelectedNote();
    } else {
      startEditingSelectedNote();
    }
  }

  function handleDraftChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setDraftBody(event.target.value);
  }

  function handleOpenDeleteDialogClick(
    event: React.MouseEvent<HTMLButtonElement>,
  ): void {
    event.preventDefault();
    setIsDeleteDialogOpen(true);
  }

  function handleCloseDeleteDialog(): void {
    setIsDeleteDialogOpen(false);
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
      <div className={styles.toolbar}>
        <Typography variant="h4" component="h1">
          {selectedNote.title}
        </Typography>
        <div className={styles.actions}>
          <IconButton
            aria-label={isEditing ? 'Finish editing' : 'Edit note'}
            onClick={handleToggleEditClick}
          >
            {isEditing ? <CheckOutlined /> : <EditOutlined />}
          </IconButton>
          <IconButton
            aria-label="Delete note"
            onClick={handleOpenDeleteDialogClick}
          >
            <DeleteOutline />
          </IconButton>
        </div>
      </div>

      <div className={styles.content}>
        {isEditing ? (
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

      <Dialog open={isDeleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete note?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={confirmDeleteSelectedNote}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isSavePromptDialogOpen}
        onClose={handleSavePromptClose}
        disableEscapeKeyDown
      >
        <DialogTitle>Save note text?</DialogTitle>
        <DialogActions>
          <Button onClick={handleSavePromptNo}>No</Button>
          <Button variant="contained" onClick={handleSavePromptYes}>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

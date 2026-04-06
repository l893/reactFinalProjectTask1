import { NotesSidebar } from '@widgets/notes-sidebar/notes-sidebar';
import { NotesWorkspace } from '@widgets/notes-workspace/notes-workspace';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { useNotesActions, useNotesState } from '@features/notes';
import { useAuthActions } from '@features/auth';
import { useDebouncedValue } from '@shared/hooks/use-debounced-value';
import { useHotkeys } from '@shared/hooks/use-hotkeys';
import { NotesHeader } from '@widgets/notes-header/notes-header';

import styles from './notes-layout.module.scss';

export const NotesLayout = (): React.JSX.Element => {
  const searchInputElementRef = useRef<HTMLInputElement | null>(null);

  const [isEditingBody, setIsEditingBody] = useState<boolean>(false);
  const [draftBody, setDraftBody] = useState<string>('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingOriginalBody, setEditingOriginalBody] = useState<string>('');
  const [pendingSelectedNoteId, setPendingSelectedNoteId] = useState<
    string | null
  >(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isSavePromptDialogOpen, setIsSavePromptDialogOpen] =
    useState<boolean>(false);

  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [draftTitle, setDraftTitle] = useState<string>('');
  const [editingTitleNoteId, setEditingTitleNoteId] = useState<string | null>(
    null,
  );
  const [editingOriginalTitle, setEditingOriginalTitle] = useState<string>('');
  const [isSaveTitlePromptDialogOpen, setIsSaveTitlePromptDialogOpen] =
    useState<boolean>(false);

  const { notes, selectedNoteId, searchQuery } = useNotesState();
  const {
    createNote,
    deleteNote,
    selectNote,
    setSearchQuery,
    saveNoteBodyDraft,
    confirmNoteBody,
    saveNoteTitleDraft,
    confirmNoteTitle,
  } = useNotesActions();
  const authActions = useAuthActions();

  const selectedNote = notes.find((note) => note.id === selectedNoteId) ?? null;
  const selectedNoteBody = selectedNote?.body ?? '';
  const isNoteSelected = Boolean(selectedNote);
  const debouncedDraftBody = useDebouncedValue(draftBody, 600);

  const focusSearchInput = useCallback((): void => {
    searchInputElementRef.current?.focus();
  }, []);

  function handleSearchQueryChange(nextSearchQuery: string): void {
    setSearchQuery(nextSearchQuery);
  }

  function handleLogout(): void {
    void authActions.signOut();
  }

  function beginBodyEditing(): void {
    if (!selectedNote) return;
    setEditingNoteId(selectedNote.id);
    setEditingOriginalBody(selectedNote.body);
    setDraftBody(selectedNote.body);
    setIsEditingBody(true);
  }

  const stopBodyEditing = useCallback((): void => {
    setIsEditingBody(false);
    setEditingNoteId(null);
    setEditingOriginalBody('');
    setDraftBody('');
  }, []);

  const finalizeBodyEditing = useCallback((): void => {
    if (!editingNoteId) return;
    if (draftBody !== editingOriginalBody) {
      confirmNoteBody(editingNoteId, draftBody);
    }
    stopBodyEditing();
  }, [
    confirmNoteBody,
    draftBody,
    editingNoteId,
    editingOriginalBody,
    stopBodyEditing,
  ]);

  function handleToggleEditBody(): void {
    if (!selectedNote) return;
    if (isEditingBody) {
      finalizeBodyEditing();
      return;
    }
    beginBodyEditing();
  }

  function handleDraftBodyChange(nextBody: string): void {
    setDraftBody(nextBody);
  }

  function handleRequestDeleteNote(): void {
    if (!selectedNote) return;
    setIsDeleteDialogOpen(true);
  }

  function handleCloseDeleteDialog(): void {
    setIsDeleteDialogOpen(false);
  }

  function handleConfirmDeleteNote(): void {
    if (!selectedNote) return;
    deleteNote(selectedNote.id);
    setIsDeleteDialogOpen(false);
    setIsSavePromptDialogOpen(false);
    setPendingSelectedNoteId(null);
    stopBodyEditing();
  }

  const proceedToPendingNote = useCallback((): void => {
    if (!pendingSelectedNoteId) return;
    selectNote(pendingSelectedNoteId);
    setPendingSelectedNoteId(null);
  }, [pendingSelectedNoteId, selectNote]);

  // function handleSavePromptYes(): void {
  //   if (!editingNoteId) return;
  //   updateNoteBody(editingNoteId, draftBody);
  //   setIsSavePromptDialogOpen(false);
  //   stopBodyEditing();
  //   proceedToPendingNote();
  // }

  const handleSavePromptYes = useCallback((): void => {
    if (!editingNoteId) return;

    confirmNoteBody(editingNoteId, draftBody);
    setIsSavePromptDialogOpen(false);
    stopBodyEditing();
    proceedToPendingNote();
  }, [
    confirmNoteBody,
    draftBody,
    editingNoteId,
    proceedToPendingNote,
    stopBodyEditing,
  ]);

  // function handleSavePromptNo(): void {
  //   if (!editingNoteId) return;
  //   updateNoteBody(editingNoteId, editingOriginalBody);
  //   setIsSavePromptDialogOpen(false);
  //   stopBodyEditing();
  //   proceedToPendingNote();
  // }

  const handleSavePromptNo = useCallback((): void => {
    if (!editingNoteId) return;
    saveNoteBodyDraft(editingNoteId, editingOriginalBody);
    setIsSavePromptDialogOpen(false);
    stopBodyEditing();
    proceedToPendingNote();
  }, [
    editingOriginalBody,
    editingNoteId,
    proceedToPendingNote,
    saveNoteBodyDraft,
    stopBodyEditing,
  ]);

  const handleSavePromptClose = useCallback((): void => {
    setIsSavePromptDialogOpen(false);
    setPendingSelectedNoteId(null);
  }, []);

  const stopTitleEditing = useCallback((): void => {
    setIsEditingTitle(false);
    setEditingTitleNoteId(null);
    setEditingOriginalTitle('');
    setDraftTitle('');
  }, []);

  const beginTitleEditing = useCallback((): void => {
    if (!selectedNote) return;
    setEditingTitleNoteId(selectedNote.id);
    setEditingOriginalTitle(selectedNote.title);
    setDraftTitle(selectedNote.title);
    setIsEditingTitle(true);
  }, [selectedNote]);

  const finalizeTitleEditing = useCallback((): void => {
    if (!editingTitleNoteId) return;
    if (draftTitle !== editingOriginalTitle) {
      confirmNoteTitle(editingTitleNoteId, draftTitle);
    }
    stopTitleEditing();
  }, [
    confirmNoteTitle,
    draftTitle,
    editingOriginalTitle,
    editingTitleNoteId,
    stopTitleEditing,
  ]);

  const handleToggleEditTitle = useCallback((): void => {
    if (!selectedNote) return;
    if (isEditingTitle) {
      finalizeTitleEditing();
      return;
    }
    beginTitleEditing();
  }, [beginTitleEditing, finalizeTitleEditing, isEditingTitle, selectedNote]);

  const handleDraftTitleChange = useCallback((nextTitle: string): void => {
    setDraftTitle(nextTitle);
  }, []);

  const handleSaveTitlePromptClose = useCallback((): void => {
    setIsSaveTitlePromptDialogOpen(false);
    setPendingSelectedNoteId(null);
  }, []);

  const handleSaveTitlePromptYes = useCallback((): void => {
    if (!editingTitleNoteId) return;
    confirmNoteTitle(editingTitleNoteId, draftTitle);
    setIsSaveTitlePromptDialogOpen(false);
    stopTitleEditing();
    proceedToPendingNote();
  }, [
    confirmNoteTitle,
    draftTitle,
    editingTitleNoteId,
    proceedToPendingNote,
    stopTitleEditing,
  ]);

  const handleSaveTitlePromptNo = useCallback((): void => {
    if (!editingTitleNoteId) return;
    saveNoteTitleDraft(editingTitleNoteId, editingOriginalTitle);
    setIsSaveTitlePromptDialogOpen(false);
    stopTitleEditing();
    proceedToPendingNote();
  }, [
    editingOriginalTitle,
    editingTitleNoteId,
    proceedToPendingNote,
    saveNoteTitleDraft,
    stopTitleEditing,
  ]);

  const hotkeys = useMemo(() => {
    return [
      {
        key: 'n',
        ctrlOrMeta: true,
        handler: createNote,
      },
      {
        key: 'f',
        ctrlOrMeta: true,
        handler: focusSearchInput,
      },
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

          if (isSaveTitlePromptDialogOpen) {
            handleSaveTitlePromptClose();
            return;
          }

          if (isEditingBody) {
            finalizeBodyEditing();
            return;
          }

          if (isEditingTitle) {
            finalizeTitleEditing();
          }
        },
      },
    ];
  }, [
    createNote,
    focusSearchInput,
    finalizeBodyEditing,
    handleSavePromptClose,
    handleSaveTitlePromptClose,
    isDeleteDialogOpen,
    isEditingBody,
    isEditingTitle,
    isSavePromptDialogOpen,
    isSaveTitlePromptDialogOpen,
    finalizeTitleEditing,
  ]);

  useHotkeys(hotkeys);

  useEffect(() => {
    setIsDeleteDialogOpen(false);
  }, [selectedNoteId]);

  useEffect(() => {
    if (!isEditingBody) return;
    if (!editingNoteId) return;
    if (!selectedNoteId) return;
    if (selectedNoteId === editingNoteId) return;

    const hasUnsavedDraft = draftBody !== editingOriginalBody;

    if (hasUnsavedDraft) {
      setPendingSelectedNoteId(selectedNoteId);
      setIsSavePromptDialogOpen(true);
      selectNote(editingNoteId);
      return;
    }

    stopBodyEditing();
  }, [
    draftBody,
    editingNoteId,
    editingOriginalBody,
    isEditingBody,
    selectedNoteId,
    selectNote,
    stopBodyEditing,
  ]);

  useEffect(() => {
    if (!isEditingTitle) return;
    if (!editingTitleNoteId) return;
    if (!selectedNoteId) return;
    if (selectedNoteId === editingTitleNoteId) return;

    const hasUnsavedTitleDraft = draftTitle !== editingOriginalTitle;
    if (hasUnsavedTitleDraft) {
      setPendingSelectedNoteId(selectedNoteId);
      setIsSaveTitlePromptDialogOpen(true);
      selectNote(editingTitleNoteId);
      return;
    }

    stopTitleEditing();
  }, [
    draftTitle,
    editingOriginalTitle,
    editingTitleNoteId,
    isEditingTitle,
    selectedNoteId,
    selectNote,
    stopTitleEditing,
  ]);

  useEffect(() => {
    if (!isEditingBody) return;
    if (!editingNoteId) return;
    if (isSavePromptDialogOpen) return;
    if (selectedNoteId !== editingNoteId) return;
    if (debouncedDraftBody === selectedNoteBody) return;
    saveNoteBodyDraft(editingNoteId, debouncedDraftBody);
  }, [
    debouncedDraftBody,
    editingNoteId,
    isEditingBody,
    isSavePromptDialogOpen,
    selectedNoteBody,
    selectedNoteId,
    saveNoteBodyDraft,
  ]);

  return (
    <div className={styles.layout}>
      <NotesHeader
        searchQuery={searchQuery}
        searchInputElementRef={searchInputElementRef}
        isNoteSelected={isNoteSelected}
        isEditingBody={isEditingBody}
        isEditingTitle={isEditingTitle}
        onSearchQueryChange={handleSearchQueryChange}
        onCreateNote={createNote}
        onToggleEditBody={handleToggleEditBody}
        onToggleEditTitle={handleToggleEditTitle}
        onRequestDeleteNote={handleRequestDeleteNote}
        onLogout={handleLogout}
      />

      <div className={styles.main}>
        <aside className={styles.sidebar}>
          <NotesSidebar />
        </aside>
        <section className={styles.workspace}>
          <NotesWorkspace
            selectedNote={selectedNote}
            isEditingBody={isEditingBody}
            draftBody={draftBody}
            onDraftBodyChange={handleDraftBodyChange}
            isEditingTitle={isEditingTitle}
            draftTitle={draftTitle}
            onDraftTitleChange={handleDraftTitleChange}
          />
        </section>
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
            onClick={handleConfirmDeleteNote}
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

      <Dialog
        open={isSaveTitlePromptDialogOpen}
        onClose={handleSaveTitlePromptClose}
        disableEscapeKeyDown
      >
        <DialogTitle>Save note title?</DialogTitle>
        <DialogActions>
          <Button onClick={handleSaveTitlePromptNo}>No</Button>
          <Button variant="contained" onClick={handleSaveTitlePromptYes}>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

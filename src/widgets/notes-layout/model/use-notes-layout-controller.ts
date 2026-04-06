import type { ComponentProps } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAuthActions } from '@features/auth';
import { useNotesActions, useNotesState } from '@features/notes';
import { useDebouncedValue } from '@shared/hooks/use-debounced-value';
import { useHotkeys } from '@shared/hooks/use-hotkeys';
import { NotesHeader } from '@widgets/notes-header/notes-header';
import { NotesWorkspace } from '@widgets/notes-workspace/notes-workspace';

type NotesHeaderProps = ComponentProps<typeof NotesHeader>;
type NotesWorkspaceProps = ComponentProps<typeof NotesWorkspace>;

export interface NotesLayoutController {
  headerProps: NotesHeaderProps;
  workspaceProps: NotesWorkspaceProps;
  isDeleteDialogOpen: boolean;
  isSaveBodyPromptDialogOpen: boolean;
  isSaveTitlePromptDialogOpen: boolean;
  closeDeleteDialog: () => void;
  confirmDeleteNote: () => void;
  closeSaveBodyPromptDialog: () => void;
  confirmSaveBodyPromptYes: () => void;
  confirmSaveBodyPromptNo: () => void;
  closeSaveTitlePromptDialog: () => void;
  confirmSaveTitlePromptYes: () => void;
  confirmSaveTitlePromptNo: () => void;
}

export function useNotesLayoutController(): NotesLayoutController {
  const searchInputElementRef = useRef<HTMLInputElement | null>(null);

  const [isEditingBody, setIsEditingBody] = useState<boolean>(false);
  const [draftBody, setDraftBody] = useState<string>('');
  const [editingBodyNoteId, setEditingBodyNoteId] = useState<string | null>(
    null,
  );
  const [editingOriginalBody, setEditingOriginalBody] = useState<string>('');

  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [draftTitle, setDraftTitle] = useState<string>('');
  const [editingTitleNoteId, setEditingTitleNoteId] = useState<string | null>(
    null,
  );
  const [editingOriginalTitle, setEditingOriginalTitle] = useState<string>('');

  const [pendingSelectedNoteId, setPendingSelectedNoteId] = useState<
    string | null
  >(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isSaveBodyPromptDialogOpen, setIsSaveBodyPromptDialogOpen] =
    useState<boolean>(false);
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

  const handleSearchQueryChange = useCallback(
    (nextSearchQuery: string): void => {
      setSearchQuery(nextSearchQuery);
    },
    [setSearchQuery],
  );

  const handleLogout = useCallback((): void => {
    void authActions.signOut();
  }, [authActions]);

  const beginBodyEditing = useCallback((): void => {
    if (!selectedNote) return;
    setEditingBodyNoteId(selectedNote.id);
    setEditingOriginalBody(selectedNote.body);
    setDraftBody(selectedNote.body);
    setIsEditingBody(true);
  }, [selectedNote]);

  const stopBodyEditing = useCallback((): void => {
    setIsEditingBody(false);
    setEditingBodyNoteId(null);
    setEditingOriginalBody('');
    setDraftBody('');
  }, []);

  const finalizeBodyEditing = useCallback((): void => {
    if (!editingBodyNoteId) return;
    if (draftBody !== editingOriginalBody) {
      confirmNoteBody(editingBodyNoteId, draftBody);
    }
    stopBodyEditing();
  }, [
    confirmNoteBody,
    draftBody,
    editingBodyNoteId,
    editingOriginalBody,
    stopBodyEditing,
  ]);

  const handleToggleEditBody = useCallback((): void => {
    if (!selectedNote) return;
    if (isEditingBody) {
      finalizeBodyEditing();
      return;
    }
    beginBodyEditing();
  }, [beginBodyEditing, finalizeBodyEditing, isEditingBody, selectedNote]);

  const handleDraftBodyChange = useCallback((nextBody: string): void => {
    setDraftBody(nextBody);
  }, []);

  const beginTitleEditing = useCallback((): void => {
    if (!selectedNote) return;
    setEditingTitleNoteId(selectedNote.id);
    setEditingOriginalTitle(selectedNote.title);
    setDraftTitle(selectedNote.title);
    setIsEditingTitle(true);
  }, [selectedNote]);

  const stopTitleEditing = useCallback((): void => {
    setIsEditingTitle(false);
    setEditingTitleNoteId(null);
    setEditingOriginalTitle('');
    setDraftTitle('');
  }, []);

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

  const requestDeleteNote = useCallback((): void => {
    if (!selectedNote) return;
    setIsDeleteDialogOpen(true);
  }, [selectedNote]);

  const closeDeleteDialog = useCallback((): void => {
    setIsDeleteDialogOpen(false);
  }, []);

  const confirmDeleteNote = useCallback((): void => {
    if (!selectedNote) return;
    deleteNote(selectedNote.id);
    setIsDeleteDialogOpen(false);
    setIsSaveBodyPromptDialogOpen(false);
    setIsSaveTitlePromptDialogOpen(false);
    setPendingSelectedNoteId(null);
    stopBodyEditing();
    stopTitleEditing();
  }, [deleteNote, selectedNote, stopBodyEditing, stopTitleEditing]);

  const proceedToPendingNote = useCallback((): void => {
    if (!pendingSelectedNoteId) return;
    selectNote(pendingSelectedNoteId);
    setPendingSelectedNoteId(null);
  }, [pendingSelectedNoteId, selectNote]);

  const closeSaveBodyPromptDialog = useCallback((): void => {
    setIsSaveBodyPromptDialogOpen(false);
    setPendingSelectedNoteId(null);
  }, []);

  const confirmSaveBodyPromptYes = useCallback((): void => {
    if (!editingBodyNoteId) return;
    confirmNoteBody(editingBodyNoteId, draftBody);
    setIsSaveBodyPromptDialogOpen(false);
    stopBodyEditing();
    proceedToPendingNote();
  }, [
    confirmNoteBody,
    draftBody,
    editingBodyNoteId,
    proceedToPendingNote,
    stopBodyEditing,
  ]);

  const confirmSaveBodyPromptNo = useCallback((): void => {
    if (!editingBodyNoteId) return;
    saveNoteBodyDraft(editingBodyNoteId, editingOriginalBody);
    setIsSaveBodyPromptDialogOpen(false);
    stopBodyEditing();
    proceedToPendingNote();
  }, [
    editingBodyNoteId,
    editingOriginalBody,
    proceedToPendingNote,
    saveNoteBodyDraft,
    stopBodyEditing,
  ]);

  const closeSaveTitlePromptDialog = useCallback((): void => {
    setIsSaveTitlePromptDialogOpen(false);
    setPendingSelectedNoteId(null);
  }, []);

  const confirmSaveTitlePromptYes = useCallback((): void => {
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

  const confirmSaveTitlePromptNo = useCallback((): void => {
    if (!editingTitleNoteId) return;
    setIsSaveTitlePromptDialogOpen(false);
    stopTitleEditing();
    proceedToPendingNote();
  }, [editingTitleNoteId, proceedToPendingNote, stopTitleEditing]);

  const hotkeys = useMemo(() => {
    return [
      { key: 'n', ctrlOrMeta: true, handler: createNote },
      { key: 'f', ctrlOrMeta: true, handler: focusSearchInput },
      {
        key: 'escape',
        handler: () => {
          if (isDeleteDialogOpen) {
            setIsDeleteDialogOpen(false);
            return;
          }

          if (isSaveBodyPromptDialogOpen) {
            closeSaveBodyPromptDialog();
            return;
          }

          if (isSaveTitlePromptDialogOpen) {
            closeSaveTitlePromptDialog();
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
    closeSaveBodyPromptDialog,
    closeSaveTitlePromptDialog,
    createNote,
    finalizeBodyEditing,
    finalizeTitleEditing,
    focusSearchInput,
    isDeleteDialogOpen,
    isEditingBody,
    isEditingTitle,
    isSaveBodyPromptDialogOpen,
    isSaveTitlePromptDialogOpen,
  ]);

  useHotkeys(hotkeys);

  useEffect(() => {
    setIsDeleteDialogOpen(false);
  }, [selectedNoteId]);

  useEffect(() => {
    if (!isEditingBody) return;
    if (!editingBodyNoteId) return;
    if (!selectedNoteId) return;
    if (selectedNoteId === editingBodyNoteId) return;

    const hasUnsavedDraft = draftBody !== editingOriginalBody;

    if (hasUnsavedDraft) {
      setPendingSelectedNoteId(selectedNoteId);
      setIsSaveBodyPromptDialogOpen(true);
      selectNote(editingBodyNoteId);
      return;
    }

    stopBodyEditing();
  }, [
    draftBody,
    editingBodyNoteId,
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
    if (!editingBodyNoteId) return;
    if (isSaveBodyPromptDialogOpen) return;
    if (selectedNoteId !== editingBodyNoteId) return;
    if (debouncedDraftBody === selectedNoteBody) return;
    saveNoteBodyDraft(editingBodyNoteId, debouncedDraftBody);
  }, [
    debouncedDraftBody,
    editingBodyNoteId,
    isEditingBody,
    isSaveBodyPromptDialogOpen,
    saveNoteBodyDraft,
    selectedNoteBody,
    selectedNoteId,
  ]);

  const headerProps: NotesHeaderProps = {
    searchQuery,
    searchInputElementRef,
    isNoteSelected,
    isEditingBody,
    isEditingTitle,
    onSearchQueryChange: handleSearchQueryChange,
    onCreateNote: createNote,
    onToggleEditBody: handleToggleEditBody,
    onToggleEditTitle: handleToggleEditTitle,
    onRequestDeleteNote: requestDeleteNote,
    onLogout: handleLogout,
  };

  const workspaceProps: NotesWorkspaceProps = {
    selectedNote,
    isEditingBody,
    draftBody,
    onDraftBodyChange: handleDraftBodyChange,
    isEditingTitle,
    draftTitle,
    onDraftTitleChange: handleDraftTitleChange,
  };

  return {
    headerProps,
    workspaceProps,
    isDeleteDialogOpen,
    isSaveBodyPromptDialogOpen,
    isSaveTitlePromptDialogOpen,
    closeDeleteDialog,
    confirmDeleteNote,
    closeSaveBodyPromptDialog,
    confirmSaveBodyPromptYes,
    confirmSaveBodyPromptNo,
    closeSaveTitlePromptDialog,
    confirmSaveTitlePromptYes,
    confirmSaveTitlePromptNo,
  };
}

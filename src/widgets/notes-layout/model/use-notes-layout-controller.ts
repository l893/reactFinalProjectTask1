import type { ComponentProps } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAuthActions } from '@features/auth';
import { useNotesActions, useNotesState } from '@features/notes';
import { useHotkeys } from '@shared/hooks/use-hotkeys';
import { NotesHeader } from '@widgets/notes-header/notes-header';
import { NotesWorkspace } from '@widgets/notes-workspace/notes-workspace';

import { useConfirmableDraft } from './use-confirmable-draft';

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

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

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
  const isNoteSelected = Boolean(selectedNote);

  const bodyEditor = useConfirmableDraft<string>({
    initialDraftValue: '',
    selectedItemId: selectedNoteId,
    onSelectItem: selectNote,
    onConfirm: confirmNoteBody,
    onAutoSaveDraft: saveNoteBodyDraft,
    autoSaveDelayMs: 600,
    onDiscard: (noteId, originalBody) => {
      saveNoteBodyDraft(noteId, originalBody);
    },
  });

  const titleEditor = useConfirmableDraft<string>({
    initialDraftValue: 'New note',
    selectedItemId: selectedNoteId,
    onSelectItem: selectNote,
    onConfirm: confirmNoteTitle,
  });

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

  const handleToggleEditBody = useCallback((): void => {
    if (!selectedNote) return;
    if (titleEditor.isEditing) return;

    if (bodyEditor.isEditing) {
      bodyEditor.finishEditing();
      return;
    }

    bodyEditor.startEditing(selectedNote.id, selectedNote.body);
  }, [bodyEditor, selectedNote, titleEditor.isEditing]);

  const handleToggleEditTitle = useCallback((): void => {
    if (!selectedNote) return;
    if (bodyEditor.isEditing) return;

    if (titleEditor.isEditing) {
      titleEditor.finishEditing();
      return;
    }

    titleEditor.startEditing(selectedNote.id, selectedNote.title);
  }, [bodyEditor.isEditing, selectedNote, titleEditor]);

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
    bodyEditor.stopEditing();
    titleEditor.stopEditing();
  }, [bodyEditor, deleteNote, selectedNote, titleEditor]);

  const closeSaveBodyPromptDialog = useCallback((): void => {
    bodyEditor.prompt.close();
  }, [bodyEditor.prompt]);

  const confirmSaveBodyPromptYes = useCallback((): void => {
    bodyEditor.prompt.confirmYes();
  }, [bodyEditor.prompt]);

  const confirmSaveBodyPromptNo = useCallback((): void => {
    bodyEditor.prompt.confirmNo();
  }, [bodyEditor.prompt]);

  const closeSaveTitlePromptDialog = useCallback((): void => {
    titleEditor.prompt.close();
  }, [titleEditor.prompt]);

  const confirmSaveTitlePromptYes = useCallback((): void => {
    titleEditor.prompt.confirmYes();
  }, [titleEditor.prompt]);

  const confirmSaveTitlePromptNo = useCallback((): void => {
    titleEditor.prompt.confirmNo();
  }, [titleEditor.prompt]);

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

          if (bodyEditor.prompt.isOpen) {
            bodyEditor.prompt.close();
            return;
          }

          if (titleEditor.prompt.isOpen) {
            titleEditor.prompt.close();
            return;
          }

          if (bodyEditor.isEditing) {
            bodyEditor.finishEditing();
            return;
          }

          if (titleEditor.isEditing) {
            titleEditor.finishEditing();
          }
        },
      },
    ];
  }, [
    bodyEditor,
    createNote,
    focusSearchInput,
    isDeleteDialogOpen,
    titleEditor,
  ]);

  useHotkeys(hotkeys);

  useEffect(() => {
    setIsDeleteDialogOpen(false);
  }, [selectedNoteId]);

  const headerProps: NotesHeaderProps = {
    searchQuery,
    searchInputElementRef,
    isNoteSelected,
    isEditingBody: bodyEditor.isEditing,
    isEditingTitle: titleEditor.isEditing,
    onSearchQueryChange: handleSearchQueryChange,
    onCreateNote: createNote,
    onToggleEditBody: handleToggleEditBody,
    onToggleEditTitle: handleToggleEditTitle,
    onRequestDeleteNote: requestDeleteNote,
    onLogout: handleLogout,
  };

  const workspaceProps: NotesWorkspaceProps = {
    selectedNote,
    isEditingBody: bodyEditor.isEditing,
    draftBody: bodyEditor.draftValue,
    onDraftBodyChange: bodyEditor.setDraftValue,
    isEditingTitle: titleEditor.isEditing,
    draftTitle: titleEditor.draftValue,
    onDraftTitleChange: titleEditor.setDraftValue,
  };

  return {
    headerProps,
    workspaceProps,
    isDeleteDialogOpen,
    isSaveBodyPromptDialogOpen: bodyEditor.prompt.isOpen,
    isSaveTitlePromptDialogOpen: titleEditor.prompt.isOpen,
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

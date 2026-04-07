import { useCallback, useEffect, useMemo, useReducer } from 'react';

import type { Note } from '@entities/note/model/note.types';
import { useAuthState } from '@features/auth';
import {
  createUserNote,
  deleteUserNote,
  subscribeToUserNotes,
  updateUserNoteBody,
  updateUserNoteTitle,
  confirmUserNoteBody,
  confirmUserNoteTitle,
} from '@entities/note/api/notes.firestore';

import { NotesActionsContext, NotesStateContext } from './notes-context';
import type { NotesActions, NotesState } from './notes.types';

interface NotesProviderProps {
  children: React.ReactNode;
}

function runNotesOperation<T>(
  promise: Promise<T>,
  operationName: string,
): void {
  void promise.catch((error) => {
    console.error(`[Notes] ${operationName} failed:`, error);
  });
}

type NotesAction =
  | { type: 'notes/received'; notes: Note[] }
  | { type: 'note/selected'; noteId: string }
  | { type: 'search/changed'; searchQuery: string }
  | { type: 'note/bodyDraftSaved'; noteId: string; body: string }
  | {
      type: 'note/bodyConfirmed';
      noteId: string;
      body: string;
      updatedAt: number;
    }
  | { type: 'note/titleDraftSaved'; noteId: string; title: string }
  | {
      type: 'note/titleConfirmed';
      noteId: string;
      title: string;
      updatedAt: number;
    }
  | { type: 'note/deleted'; noteId: string };

function notesReducer(state: NotesState, action: NotesAction): NotesState {
  switch (action.type) {
    case 'notes/received': {
      const hasSelected =
        state.selectedNoteId !== null &&
        action.notes.some((note) => note.id === state.selectedNoteId);

      return {
        ...state,
        notes: action.notes,
        selectedNoteId: hasSelected
          ? state.selectedNoteId
          : (action.notes[0]?.id ?? null),
      };
    }
    case 'note/selected': {
      return { ...state, selectedNoteId: action.noteId };
    }
    case 'search/changed': {
      return { ...state, searchQuery: action.searchQuery };
    }
    case 'note/bodyDraftSaved': {
      return {
        ...state,
        notes: state.notes.map((note) => {
          if (note.id !== action.noteId) return note;
          return { ...note, body: action.body };
        }),
      };
    }
    case 'note/bodyConfirmed': {
      return {
        ...state,
        notes: state.notes.map((note) => {
          if (note.id !== action.noteId) return note;
          return { ...note, body: action.body, updatedAt: action.updatedAt };
        }),
      };
    }
    case 'note/titleDraftSaved': {
      return {
        ...state,
        notes: state.notes.map((note) => {
          if (note.id !== action.noteId) return note;
          return { ...note, title: action.title };
        }),
      };
    }
    case 'note/titleConfirmed': {
      return {
        ...state,
        notes: state.notes.map((note) => {
          if (note.id !== action.noteId) return note;
          return { ...note, title: action.title, updatedAt: action.updatedAt };
        }),
      };
    }
    case 'note/deleted': {
      const nextNotes = state.notes.filter((note) => note.id !== action.noteId);
      const nextSelectedNoteId =
        state.selectedNoteId === action.noteId
          ? (nextNotes[0]?.id ?? null)
          : state.selectedNoteId;

      return {
        ...state,
        notes: nextNotes,
        selectedNoteId: nextSelectedNoteId,
      };
    }
    default: {
      return state;
    }
  }
}

const INITIAL_STATE: NotesState = {
  notes: [],
  selectedNoteId: null,
  searchQuery: '',
};

export const NotesProvider = ({
  children,
}: NotesProviderProps): React.JSX.Element => {
  const { user, isAuthReady } = useAuthState();
  const userId = user?.uid ?? null;

  const [state, dispatch] = useReducer(notesReducer, INITIAL_STATE);

  useEffect(() => {
    if (!isAuthReady) return;
    if (!userId) return;

    const unsubscribe = subscribeToUserNotes(userId, (notes) => {
      dispatch({ type: 'notes/received', notes });
    });

    return unsubscribe;
  }, [isAuthReady, userId]);

  const createNote = useCallback<NotesActions['createNote']>(() => {
    if (!userId) return;

    runNotesOperation(
      createUserNote(userId).then((newNoteId) => {
        dispatch({ type: 'note/selected', noteId: newNoteId });
      }),
      'create note',
    );
  }, [userId]);

  const selectNote = useCallback<NotesActions['selectNote']>(
    (noteId: string) => {
      dispatch({ type: 'note/selected', noteId });
    },
    [],
  );

  const setSearchQuery = useCallback<NotesActions['setSearchQuery']>(
    (searchQuery: string) => {
      dispatch({ type: 'search/changed', searchQuery });
    },
    [],
  );

  const saveNoteBodyDraft = useCallback<NotesActions['saveNoteBodyDraft']>(
    (noteId: string, body: string) => {
      if (userId) {
        runNotesOperation(
          updateUserNoteBody(userId, noteId, body),
          'save note body draft',
        );
      }
      dispatch({ type: 'note/bodyDraftSaved', noteId, body });
    },
    [userId],
  );

  const confirmNoteBody = useCallback<NotesActions['confirmNoteBody']>(
    (noteId: string, body: string) => {
      const confirmedAt = Date.now();
      if (userId) {
        runNotesOperation(
          confirmUserNoteBody(userId, noteId, body, confirmedAt),
          'confirm note body',
        );
      }
      dispatch({
        type: 'note/bodyConfirmed',
        noteId,
        body,
        updatedAt: confirmedAt,
      });
    },
    [userId],
  );

  const saveNoteTitleDraft = useCallback<NotesActions['saveNoteTitleDraft']>(
    (noteId: string, title: string) => {
      if (userId) {
        runNotesOperation(
          updateUserNoteTitle(userId, noteId, title),
          'save note title draft',
        );
      }
      dispatch({ type: 'note/titleDraftSaved', noteId, title });
    },
    [userId],
  );

  const confirmNoteTitle = useCallback<NotesActions['confirmNoteTitle']>(
    (noteId: string, title: string) => {
      const confirmedAt = Date.now();
      if (userId) {
        runNotesOperation(
          confirmUserNoteTitle(userId, noteId, title, confirmedAt),
          'confirm note title',
        );
      }
      dispatch({
        type: 'note/titleConfirmed',
        noteId,
        title,
        updatedAt: confirmedAt,
      });
    },
    [userId],
  );

  const deleteNote = useCallback<NotesActions['deleteNote']>(
    (noteId: string) => {
      if (userId) {
        runNotesOperation(deleteUserNote(userId, noteId), 'delete note');
      }
      dispatch({ type: 'note/deleted', noteId });
    },
    [userId],
  );

  const actionsValue: NotesActions = useMemo(() => {
    return {
      createNote,
      selectNote,
      setSearchQuery,
      saveNoteBodyDraft,
      confirmNoteBody,
      saveNoteTitleDraft,
      confirmNoteTitle,
      deleteNote,
    };
  }, [
    createNote,
    selectNote,
    setSearchQuery,
    saveNoteBodyDraft,
    confirmNoteBody,
    saveNoteTitleDraft,
    confirmNoteTitle,
    deleteNote,
  ]);

  return (
    <NotesStateContext value={state}>
      <NotesActionsContext value={actionsValue}>{children}</NotesActionsContext>
    </NotesStateContext>
  );
};

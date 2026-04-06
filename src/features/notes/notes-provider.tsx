import { useCallback, useEffect, useMemo, useReducer } from 'react';

import type { Note } from '@entities/note/model/note.types';
import { useAuthState } from '@features/auth';
import {
  createUserNote,
  deleteUserNote,
  subscribeToUserNotes,
  updateUserNoteBody,
} from '@entities/note/api/notes.firestore';

import { NotesActionsContext, NotesStateContext } from './notes-context';
import type { NotesActions, NotesState } from './notes.types';

interface NotesProviderProps {
  children: React.ReactNode;
}

type NotesAction =
  | { type: 'notes/received'; notes: Note[] }
  | { type: 'note/selected'; noteId: string }
  | { type: 'search/changed'; searchQuery: string }
  | {
      type: 'note/bodyUpdated';
      noteId: string;
      body: string;
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
    case 'note/bodyUpdated': {
      return {
        ...state,
        notes: state.notes.map((note) => {
          if (note.id !== action.noteId) return note;
          return { ...note, body: action.body, updatedAt: action.updatedAt };
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

    void (async () => {
      const newNoteId = await createUserNote(userId);
      dispatch({ type: 'note/selected', noteId: newNoteId });
    })();
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

  const updateNoteBody = useCallback<NotesActions['updateNoteBody']>(
    (noteId: string, body: string) => {
      if (userId) {
        void updateUserNoteBody(userId, noteId, body);
      }
      dispatch({
        type: 'note/bodyUpdated',
        noteId,
        body,
        updatedAt: Date.now(),
      });
    },
    [userId],
  );

  const deleteNote = useCallback<NotesActions['deleteNote']>(
    (noteId: string) => {
      if (userId) {
        void deleteUserNote(userId, noteId);
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
      updateNoteBody,
      deleteNote,
    };
  }, [createNote, selectNote, setSearchQuery, updateNoteBody, deleteNote]);

  return (
    <NotesStateContext value={state}>
      <NotesActionsContext value={actionsValue}>{children}</NotesActionsContext>
    </NotesStateContext>
  );
};

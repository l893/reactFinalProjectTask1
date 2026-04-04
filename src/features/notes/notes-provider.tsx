import { useCallback, useMemo, useReducer } from 'react';

import type { Note } from '@entities/note/model/note.types';
import {
  createEmptyNote,
  createSeedNotes,
} from '@entities/note/lib/note-factory';

import { NotesActionsContext, NotesStateContext } from './notes-context';
import type { NotesActions, NotesState } from './notes.types';

interface NotesProviderProps {
  children: React.ReactNode;
}

type NotesAction =
  | { type: 'note/created'; note: Note }
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
    case 'note/created': {
      return {
        ...state,
        notes: [action.note, ...state.notes],
        selectedNoteId: action.note.id,
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

function createInitialState(): NotesState {
  const seedNotes = createSeedNotes();

  return {
    notes: seedNotes,
    selectedNoteId: seedNotes.length > 0 ? seedNotes[0].id : null,
    searchQuery: '',
  };
}

export const NotesProvider = ({
  children,
}: NotesProviderProps): React.JSX.Element => {
  const [state, dispatch] = useReducer(
    notesReducer,
    undefined,
    createInitialState,
  );

  const createNote = useCallback<NotesActions['createNote']>(() => {
    const note = createEmptyNote();
    dispatch({ type: 'note/created', note });
  }, []);

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
      dispatch({
        type: 'note/bodyUpdated',
        noteId,
        body,
        updatedAt: Date.now(),
      });
    },
    [],
  );

  const deleteNote = useCallback<NotesActions['deleteNote']>(
    (noteId: string) => {
      dispatch({ type: 'note/deleted', noteId });
    },
    [],
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

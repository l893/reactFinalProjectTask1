import { createContext, use } from 'react';
import type { NotesActions, NotesState } from './notes.types';

export const NotesStateContext = createContext<NotesState | undefined>(
  undefined,
);
NotesStateContext.displayName = 'NotesStateContext';

export const NotesActionsContext = createContext<NotesActions | undefined>(
  undefined,
);
NotesActionsContext.displayName = 'NotesActionsContext';

export function useNotesState(): NotesState {
  const notesState = use(NotesStateContext);

  if (!notesState) {
    throw new Error('useNotesState must be used within <NotesProvider>.');
  }

  return notesState;
}

export function useNotesActions(): NotesActions {
  const notesActions = use(NotesActionsContext);

  if (!notesActions) {
    throw new Error('useNotesActions must be used within <NotesProvider>.');
  }

  return notesActions;
}

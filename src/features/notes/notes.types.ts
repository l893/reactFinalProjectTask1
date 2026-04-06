import type { Note } from '@entities/note/model/note.types';

export interface NotesState {
  notes: Note[];
  selectedNoteId: string | null;
  searchQuery: string;
}

export interface NotesActions {
  createNote: () => void;
  selectNote: (noteId: string) => void;
  setSearchQuery: (searchQuery: string) => void;
  saveNoteBodyDraft: (noteId: string, body: string) => void;
  confirmNoteBody: (noteId: string, body: string) => void;
  saveNoteTitleDraft: (noteId: string, title: string) => void;
  confirmNoteTitle: (noteId: string, title: string) => void;
  deleteNote: (noteId: string) => void;
}

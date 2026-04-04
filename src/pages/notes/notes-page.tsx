import { NotesProvider } from '@features/notes';
import { NotesLayout } from '@widgets/notes-layout/notes-layout';

export const NotesPage = (): React.JSX.Element => {
  return (
    <NotesProvider>
      <NotesLayout />
    </NotesProvider>
  );
};

import { NotesSidebar } from '@widgets/notes-sidebar/notes-sidebar';
import { NotesWorkspace } from '@widgets/notes-workspace/notes-workspace';
import { useRef } from 'react';
import { useNotesActions } from '@features/notes';
import { useHotkeys } from '@shared/hooks/use-hotkeys';

import styles from './notes-layout.module.scss';

export const NotesLayout = (): React.JSX.Element => {
  const searchInputElementRef = useRef<HTMLInputElement | null>(null);

  const { createNote } = useNotesActions();

  function focusSearchInput(): void {
    searchInputElementRef.current?.focus();
  }

  useHotkeys([
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
  ]);

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <NotesSidebar searchInputElementRef={searchInputElementRef} />
      </aside>
      <section className={styles.workspace}>
        <NotesWorkspace />
      </section>
    </div>
  );
};

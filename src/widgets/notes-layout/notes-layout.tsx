import { NotesSidebar } from '@widgets/notes-sidebar/notes-sidebar';
import { NotesWorkspace } from '@widgets/notes-workspace/notes-workspace';
import { DeleteNoteDialog } from './ui/delete-note-dialog';
import { SaveNoteTextDialog } from './ui/save-note-text-dialog';
import { SaveNoteTitleDialog } from './ui/save-note-title-dialog';
import { NotesHeader } from '@widgets/notes-header/notes-header';
import { useNotesLayoutController } from './model/use-notes-layout-controller';

import styles from './notes-layout.module.scss';

export const NotesLayout = (): React.JSX.Element => {
  const notesLayoutController = useNotesLayoutController();

  return (
    <div className={styles.layout}>
      <NotesHeader {...notesLayoutController.headerProps} />

      <div className={styles.main}>
        <aside className={styles.sidebar}>
          <NotesSidebar />
        </aside>
        <section className={styles.workspace}>
          <NotesWorkspace {...notesLayoutController.workspaceProps} />
        </section>
      </div>

      <DeleteNoteDialog
        isOpen={notesLayoutController.isDeleteDialogOpen}
        onCancel={notesLayoutController.closeDeleteDialog}
        onConfirm={notesLayoutController.confirmDeleteNote}
      />

      <SaveNoteTextDialog
        isOpen={notesLayoutController.isSaveBodyPromptDialogOpen}
        onClose={notesLayoutController.closeSaveBodyPromptDialog}
        onNo={notesLayoutController.confirmSaveBodyPromptNo}
        onYes={notesLayoutController.confirmSaveBodyPromptYes}
      />

      <SaveNoteTitleDialog
        isOpen={notesLayoutController.isSaveTitlePromptDialogOpen}
        onClose={notesLayoutController.closeSaveTitlePromptDialog}
        onNo={notesLayoutController.confirmSaveTitlePromptNo}
        onYes={notesLayoutController.confirmSaveTitlePromptYes}
      />
    </div>
  );
};

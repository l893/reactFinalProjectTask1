import { NotesSidebar } from '@widgets/notes-sidebar/notes-sidebar';
import { NotesWorkspace } from '@widgets/notes-workspace/notes-workspace';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
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

      <Dialog
        open={notesLayoutController.isDeleteDialogOpen}
        onClose={notesLayoutController.closeDeleteDialog}
      >
        <DialogTitle>Delete note?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={notesLayoutController.closeDeleteDialog}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={notesLayoutController.confirmDeleteNote}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={notesLayoutController.isSaveBodyPromptDialogOpen}
        onClose={notesLayoutController.closeSaveBodyPromptDialog}
        disableEscapeKeyDown
      >
        <DialogTitle>Save note text?</DialogTitle>
        <DialogActions>
          <Button onClick={notesLayoutController.confirmSaveBodyPromptNo}>
            No
          </Button>
          <Button
            variant="contained"
            onClick={notesLayoutController.confirmSaveBodyPromptYes}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={notesLayoutController.isSaveTitlePromptDialogOpen}
        onClose={notesLayoutController.closeSaveTitlePromptDialog}
        disableEscapeKeyDown
      >
        <DialogTitle>Save note title?</DialogTitle>
        <DialogActions>
          <Button onClick={notesLayoutController.confirmSaveTitlePromptNo}>
            No
          </Button>
          <Button
            variant="contained"
            onClick={notesLayoutController.confirmSaveTitlePromptYes}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

import { Button, Dialog, DialogActions, DialogTitle } from '@mui/material';

interface SaveNoteTextDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onYes: () => void;
  onNo: () => void;
}

export const SaveNoteTextDialog = (
  props: SaveNoteTextDialogProps,
): React.JSX.Element => {
  const { isOpen, onClose, onYes, onNo } = props;

  return (
    <Dialog open={isOpen} onClose={onClose} disableEscapeKeyDown>
      <DialogTitle>Save note text?</DialogTitle>
      <DialogActions>
        <Button onClick={onNo}>No</Button>
        <Button variant="contained" onClick={onYes}>
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

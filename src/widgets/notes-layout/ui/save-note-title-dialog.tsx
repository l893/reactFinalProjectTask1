import { Button, Dialog, DialogActions, DialogTitle } from '@mui/material';

interface SaveNoteTitleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onYes: () => void;
  onNo: () => void;
}

export const SaveNoteTitleDialog = (
  props: SaveNoteTitleDialogProps,
): React.JSX.Element => {
  const { isOpen, onClose, onYes, onNo } = props;

  return (
    <Dialog open={isOpen} onClose={onClose} disableEscapeKeyDown>
      <DialogTitle>Save note title?</DialogTitle>
      <DialogActions>
        <Button onClick={onNo}>No</Button>
        <Button variant="contained" onClick={onYes}>
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

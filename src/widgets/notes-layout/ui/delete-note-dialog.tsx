import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

interface DeleteNoteDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const DeleteNoteDialog = (
  props: DeleteNoteDialogProps,
): React.JSX.Element => {
  const { isOpen, onCancel, onConfirm } = props;

  return (
    <Dialog open={isOpen} onClose={onCancel}>
      <DialogTitle>Delete note?</DialogTitle>
      <DialogContent>
        <Typography variant="body2">This action cannot be undone.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button color="error" variant="contained" onClick={onConfirm}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

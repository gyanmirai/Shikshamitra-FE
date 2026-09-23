import { Iconify } from 'src/components/iconify';
import { Button, DialogActions } from '@mui/material';
import SubmitButton from 'src/components/submit-button';

type Props = {
  isLoading: boolean;
  canSubmit: boolean;
  onCancel: () => void;
  onReview: () => void;
};

export function SubjectCopyActions({ isLoading, canSubmit, onCancel, onReview }: Props) {
  return (
    <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
      <Button variant="text" color="inherit" size="small" disabled={isLoading} onClick={onCancel}>
        Cancel
      </Button>
      <SubmitButton
        buttonText="Review copy"
        disabled={!canSubmit}
        startIcon={<Iconify icon="solar:arrow-right-outline" />}
        onClick={onReview}
      />
    </DialogActions>
  );
}

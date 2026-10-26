import { GlobalIcons } from 'src/utils/icons';
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
      <Button
        type="button"
        variant="outlined"
        color="inherit"
        size="small"
        disabled={isLoading}
        onClick={onCancel}
        startIcon={<Iconify icon={GlobalIcons.cancel} />}
      >
        Cancel
      </Button>
      <SubmitButton
        buttonText="Review copy"
        type="button"
        disabled={!canSubmit || isLoading}
        startIcon={<Iconify icon={GlobalIcons.eye} />}
        onClick={onReview}
      />
    </DialogActions>
  );
}

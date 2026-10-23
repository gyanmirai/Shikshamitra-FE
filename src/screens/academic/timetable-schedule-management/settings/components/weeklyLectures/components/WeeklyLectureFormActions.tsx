'use client';

import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Button, DialogActions } from '@mui/material';

interface WeeklyLectureFormActionsProps {
  isEdit: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

export function WeeklyLectureFormActions({
  isEdit,
  isSubmitting,
  onCancel,
  onSubmit,
}: WeeklyLectureFormActionsProps) {
  const submitIcon = isEdit ? GlobalIcons.edit : GlobalIcons.submit;
  const submitSize = isEdit ? 16 : 20;

  return (
    <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
      <Button
        onClick={onCancel}
        size="small"
        variant="outlined"
        startIcon={<Iconify icon={GlobalIcons.cancel} />}
      >
        Cancel
      </Button>
      <LoadingButton
        startIcon={<Iconify icon={submitIcon} width={submitSize} height={submitSize} />}
        loading={isSubmitting}
        onClick={onSubmit}
        size="small"
        variant="contained"
      >
        Submit
      </LoadingButton>
    </DialogActions>
  );
}

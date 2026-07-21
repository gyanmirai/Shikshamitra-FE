import React from 'react';
import { LoadingButton } from '@mui/lab';
import { Restore } from '@mui/icons-material';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import { getSubjectDisplayLabel } from '../utils/getSubjectDisplayLabel';

import type { ISubjectFormValues } from './type';

interface SubjectRestoreDialogProps {
  open: boolean;
  isLoading: boolean;
  selectedSubject: ISubjectFormValues | null;
  onClose: () => void;
  onConfirm: () => void;
}

const SubjectRestoreDialog = ({
  open,
  isLoading,
  selectedSubject,
  onClose,
  onConfirm,
}: SubjectRestoreDialogProps) => {
  const subjectLabel = getSubjectDisplayLabel(selectedSubject);

  return (
    <ConfirmDialog
      open={open}
      icon="success"
      onClose={onClose}
      title="Reactivate Subject"
      content={
        <>
          Reactivate <strong>{subjectLabel}</strong>? It will be restored as Draft after duplicate
          assignment checks.
        </>
      }
      action={
        <LoadingButton
          loading={isLoading}
          variant="contained"
          color="success"
          size="small"
          startIcon={<Restore />}
          onClick={onConfirm}
        >
          Reactivate
        </LoadingButton>
      }
    />
  );
};

/**
 * Memoization Justification:
 * Always mounted but conditionally visible. React.memo avoids re-renders
 * from unrelated parent state (class changes, table loading states).
 */
export default React.memo(SubjectRestoreDialog);

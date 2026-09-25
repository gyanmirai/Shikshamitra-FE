import React from 'react';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import { getSubjectDisplayLabel } from '../utils/getSubjectDisplayLabel';

import type { ISubjectFormValues } from './type';

interface SubjectDeleteDialogProps {
  open: boolean;
  isLoading: boolean;
  selectedSubject: ISubjectFormValues | null;
  className: string;
  onClose: () => void;
  onConfirm: () => void;
}

const SubjectDeleteDialog = ({
  open,
  isLoading,
  selectedSubject,
  className,
  onClose,
  onConfirm,
}: SubjectDeleteDialogProps) => {
  const subjectLabel = getSubjectDisplayLabel(selectedSubject);
  const isElective = selectedSubject?.subjectType === 1;

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      disableBackdropClick
      title="Remove"
      content={
        <>
          Are you sure you want to remove the following{' '}
          {isElective ? 'subjects and group' : 'subject'} <strong>{subjectLabel}</strong> from Class{' '}
          {className}?
        </>
      }
      action={
        <LoadingButton
          loading={isLoading}
          disabled={isLoading}
          variant="contained"
          color="error"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.delete} />}
          onClick={onConfirm}
        >
          Yes
        </LoadingButton>
      }
    />
  );
};

/**
 * Memoization Justification:
 * Always mounted but conditionally visible via `open` prop.
 * React.memo prevents re-renders from parent state changes (class selection,
 * table data updates) that don't affect dialog props.
 */
export default React.memo(SubjectDeleteDialog);

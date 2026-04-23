import React from 'react';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';

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
}: SubjectDeleteDialogProps) => (
  <ConfirmDialog
    open={open}
    onClose={onClose}
    title="Remove"
    content={
      <>
        Are you sure you want to remove the following{' '}
        {selectedSubject?.subjectType === 1 ? 'subjects and group' : 'subject'}{' '}
        <strong>
          {selectedSubject?.subjectType === 1
            ? selectedSubject?.subjects
                ?.map((sub: any) => `${sub.subjectName} (${sub.subjectCode})`)
                .join(' , ')
            : `${selectedSubject?.subjects?.[0]?.subjectName} (${selectedSubject?.subjects?.[0]?.subjectCode})`}
        </strong>{' '}
        from Class {className}?
      </>
    }
    action={
      <LoadingButton
        loading={isLoading}
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

/**
 * Memoization Justification:
 * This dialog is always mounted in the tree but renders conditionally via `open`.
 * React.memo prevents re-renders from parent state changes (class selection,
 * table data updates) that don't affect dialog props.
 */
export default React.memo(SubjectDeleteDialog);

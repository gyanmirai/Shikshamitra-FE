import React from 'react';
import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import { getSubjectDisplayLabel } from '../utils/getSubjectDisplayLabel';

import type { ISubjectFormValues } from './type';

interface SubjectArchiveDialogProps {
  open: boolean;
  isLoading: boolean;
  selectedSubject: ISubjectFormValues | null;
  onClose: () => void;
  onConfirm: () => void;
}

const SubjectArchiveDialog = ({
  open,
  isLoading,
  selectedSubject,
  onClose,
  onConfirm,
}: SubjectArchiveDialogProps) => {
  const subjectLabel = getSubjectDisplayLabel(selectedSubject);

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      disableBackdropClick
      title="Archive Subject"
      content={
        <>
          Archive <strong>{subjectLabel}</strong>? It will no longer appear in timetable, homework
          or exam setup but existing records are preserved. You can restore it later.
        </>
      }
      action={
        <LoadingButton
          loading={isLoading}
          variant="contained"
          color="warning"
          size="small"
          startIcon={<Iconify icon="solar:archive-bold" />}
          onClick={onConfirm}
        >
          Archive
        </LoadingButton>
      }
    />
  );
};

export default React.memo(SubjectArchiveDialog);

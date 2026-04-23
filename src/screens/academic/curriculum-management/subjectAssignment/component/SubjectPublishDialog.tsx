import React from 'react';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { PublishUnpublishStatusType } from 'src/enums/publishUnpublish-status';

import { getSubjectDisplayLabel } from '../utils/getSubjectDisplayLabel';

import type { ISubjectFormValues } from './type';

interface SubjectPublishDialogProps {
  open: boolean;
  isLoading: boolean;
  selectedSubject: ISubjectFormValues | null;
  onClose: () => void;
  onConfirm: () => void;
}

const SubjectPublishDialog = ({
  open,
  isLoading,
  selectedSubject,
  onClose,
  onConfirm,
}: SubjectPublishDialogProps) => {
  const isPublished = selectedSubject?.status === PublishUnpublishStatusType.Published;
  const subjectLabel = getSubjectDisplayLabel(selectedSubject);

  return (
    <ConfirmDialog
      open={open}
      icon={isPublished ? 'warning' : 'success'}
      onClose={onClose}
      title={isPublished ? 'Draft' : 'Publish'}
      content={
        <>
          Are you sure you want to move <strong>{subjectLabel}</strong> subject to{' '}
          {isPublished ? 'Draft' : 'Publish'}?
        </>
      }
      action={
        <LoadingButton
          loading={isLoading}
          variant="contained"
          size="small"
          startIcon={<Iconify icon={isPublished ? GlobalIcons.publish : GlobalIcons.draftIcon} />}
          onClick={onConfirm}
        >
          {isPublished ? 'Draft' : 'Publish'}
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
export default React.memo(SubjectPublishDialog);

import React from 'react';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Button, DialogActions } from '@mui/material';
import { PublishUnpublishStatusType } from 'src/enums/publishUnpublish-status';

interface SubjectFormActionsProps {
  isEdit?: boolean;
  isAddLoading: boolean;
  isUpdateLoading: boolean;
  currentStatus: number;
  onCancel: () => void;
  onSubmit: () => void;
  onDraft: () => void;
  onPublish: () => void;
}

const SubjectFormActions = ({
  isEdit,
  isAddLoading,
  isUpdateLoading,
  currentStatus,
  onCancel,
  onSubmit,
  onDraft,
  onPublish,
}: SubjectFormActionsProps) => (
  <DialogActions
    sx={{
      p: 2,
      gap: 1,
      borderTop: (theme) => `1px solid ${theme.palette.divider}`,
      bgcolor: 'background.paper',
      boxShadow: 'var(--shadows-10)',
    }}
  >
    {isEdit ? (
      <>
        <Button
          variant="outlined"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={onCancel}
          disabled={isAddLoading || isUpdateLoading}
          size="small"
        >
          Cancel
        </Button>
        <LoadingButton
          size="small"
          variant="contained"
          onClick={onSubmit}
          loading={isUpdateLoading}
          disabled={isAddLoading || isUpdateLoading}
          startIcon={<Iconify icon={GlobalIcons.edit} width={16} height={16} />}
        >
          Update
        </LoadingButton>
      </>
    ) : (
      <>
        <LoadingButton
          size="small"
          type="button"
          variant="outlined"
          onClick={onDraft}
          loading={isAddLoading && currentStatus === PublishUnpublishStatusType.Draft}
          disabled={isAddLoading || isUpdateLoading}
          startIcon={<Iconify icon={GlobalIcons.draftIcon} />}
        >
          Save Draft
        </LoadingButton>
        <LoadingButton
          size="small"
          type="button"
          variant="contained"
          onClick={onPublish}
          loading={isAddLoading && currentStatus === PublishUnpublishStatusType.Published}
          disabled={isAddLoading || isUpdateLoading}
          startIcon={<Iconify icon={GlobalIcons.publish} />}
        >
          Publish
        </LoadingButton>
      </>
    )}
  </DialogActions>
);

/**
 * Memoization Justification:
 * Pure presentational component receiving stable primitive props.
 * React.memo prevents re-renders when form field values change but
 * action button props remain the same.
 */
export default React.memo(SubjectFormActions);

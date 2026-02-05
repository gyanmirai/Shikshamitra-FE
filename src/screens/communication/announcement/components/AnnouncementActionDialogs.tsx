import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import { Box, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import AnnouncementRemoveReasonForm from '../removePublishForm';

import type { ISchoolWiseAnnouncement } from '../type';

// ----------------------------------------------------------------------

interface Props {
  deleteDialog: {
    value: boolean;
    onFalse: () => void;
  };
  publishModal: {
    value: boolean;
    onFalse: () => void;
  };
  confirmDialog: {
    value: boolean;
    onFalse: () => void;
  };
  editingAnnouncement: ISchoolWiseAnnouncement | null;
  publishingAnnouncement: ISchoolWiseAnnouncement | null;
  removeAnnouncement: ISchoolWiseAnnouncement | null;
  isDeleteLoading: boolean;
  isPublishLoading: boolean;
  onDeleteCommit: () => void;
  onPublishCommit: () => void;
  onCloseRemoveDialog: () => void; // Specific handler for remove dialog close
  onCloseDeleteDialog: () => void; // Specific handler for delete dialog close
  onClosePublishDialog: () => void; // Specific handler for publish dialog close
  onCloseGlobal: (_e: any, isSubmit?: boolean) => void; // For the form inside CustomDialog
}

export default function AnnouncementActionDialogs({
  deleteDialog,
  publishModal,
  confirmDialog,
  editingAnnouncement,
  publishingAnnouncement,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  removeAnnouncement,
  isDeleteLoading,
  isPublishLoading,
  onDeleteCommit,
  onPublishCommit,
  onCloseRemoveDialog,
  onCloseDeleteDialog,
  onClosePublishDialog,
  onCloseGlobal,
}: Props) {
  return (
    <>
      <ConfirmDialog
        open={deleteDialog.value}
        onClose={onCloseDeleteDialog}
        title="Delete"
        content={
          <>
            Are you sure you want to delete the{' '}
            <strong>&apos;{editingAnnouncement?.title}&apos;</strong> announcement?
          </>
        }
        action={
          <LoadingButton
            loading={isDeleteLoading}
            variant="contained"
            color="error"
            size="small"
            onClick={onDeleteCommit}
          >
            Yes
          </LoadingButton>
        }
      />

      <ConfirmDialog
        icon="success"
        open={publishModal.value}
        onClose={onClosePublishDialog}
        title="Publish"
        content={
          <>
            Are you sure you want to publish{' '}
            <strong>&apos;{publishingAnnouncement?.title}&apos; </strong>announcement?
            {publishingAnnouncement?.endDate && (
              <>
                <br />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {(() => {
                    const now = dayjs();
                    const end = dayjs(publishingAnnouncement.endDate);
                    if (end.isSame(now, 'day')) {
                      const hours = end.diff(now, 'hour');
                      return `This announcement will be published for ${hours} hour${hours !== 1 ? 's' : ''} until ${end.format('MMM D, YYYY h:mm A')}.`;
                    }
                    const days = end.diff(now, 'day');
                    return `This announcement will be published for ${days} day${days !== 1 ? 's' : ''} until ${end.format('MMM D, YYYY h:mm A')}.`;
                  })()}
                </Typography>
              </>
            )}
          </>
        }
        action={
          <LoadingButton
            loading={isPublishLoading}
            variant="contained"
            color="error"
            size="small"
            onClick={onPublishCommit}
          >
            Yes
          </LoadingButton>
        }
      />

      <CustomDialog
        open={confirmDialog.value}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Remove Annnouncement</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Remove announcement from the system. This action will permanently delete the announcement and it will no longer be visible to users."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        handleClose={onCloseRemoveDialog}
        maxWidth="xs"
      >
        <AnnouncementRemoveReasonForm onClose={onCloseGlobal} />
      </CustomDialog>
    </>
  );
}

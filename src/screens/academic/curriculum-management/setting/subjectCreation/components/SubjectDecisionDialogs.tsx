import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Box, Alert, TextField, Typography } from '@mui/material';

import { SubjectDeleteDialog } from './SubjectDeleteDialog';

import type { ISubject } from '../type';

export interface SubjectDecisionDialogProps {
  archiveOpen: boolean;
  deleteOpen: boolean;
  onCloseArchive: () => void;
  onCloseDelete: () => void;
  isArchiveLoading: boolean;
  isDeleteLoading: boolean;
  selectedSubject: ISubject | null;
  setSelectedSubject: (value: ISubject | null) => void;
  currentMedium: { id: string };
  archiveReason: string;
  setArchiveReason: (value: string) => void;
  archiveSubject: (args: { academicMediumId: string; id?: string; body: { reason: string } }) => {
    unwrap: () => Promise<unknown>;
  };
  deleteSubject: (args: { academicMediumId: string; id: string }) => {
    unwrap: () => Promise<unknown>;
  };
}
export function SubjectDecisionDialogs({
  archiveOpen,
  deleteOpen,
  onCloseArchive,
  onCloseDelete,
  isArchiveLoading,
  isDeleteLoading,
  selectedSubject,
  setSelectedSubject,
  currentMedium,
  archiveReason,
  setArchiveReason,
  archiveSubject,
  deleteSubject,
}: SubjectDecisionDialogProps) {
  return (
    <>
      <ConfirmDialog
        open={archiveOpen}
        onClose={() => {
          if (isArchiveLoading) return;
          setSelectedSubject(null);
          onCloseArchive();
        }}
        title="Archive Subject"
        icon="warning"
        disableBackdropClick
        disableEscapeKeyDown={isArchiveLoading}
        disableCancel={isArchiveLoading}
        content={
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Archive <strong>{selectedSubject?.name}</strong>?
            </Typography>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Archived subjects will not be available for new allocations but will remain visible in
              old records.
            </Alert>
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Reason for archiving"
              disabled={isArchiveLoading}
              value={archiveReason}
              onChange={(event) => setArchiveReason(event.target.value)}
            />
          </Box>
        }
        action={
          <LoadingButton
            loading={isArchiveLoading}
            type="button"
            startIcon={<Iconify icon={GlobalIcons.archive} width={16} />}
            variant="contained"
            color="inherit"
            size="small"
            onClick={async () => {
              if (!selectedSubject) return;
              try {
                await archiveSubject({
                  academicMediumId: currentMedium.id,
                  id: selectedSubject?.id,
                  body: { reason: archiveReason },
                }).unwrap();
                shikshaMitraToast.success({ message: 'Subject archived successfully.' });
                onCloseArchive();
                setSelectedSubject(null);
              } catch (error: any) {
                shikshaMitraToast.error({
                  message: error?.data?.message || 'Failed to archive subject.',
                });
              }
            }}
          >
            Archive
          </LoadingButton>
        }
      />

      <SubjectDeleteDialog
        deleteOpen={deleteOpen}
        onCloseDelete={onCloseDelete}
        isDeleteLoading={isDeleteLoading}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        currentMedium={currentMedium}
        deleteSubject={deleteSubject}
      />
    </>
  );
}

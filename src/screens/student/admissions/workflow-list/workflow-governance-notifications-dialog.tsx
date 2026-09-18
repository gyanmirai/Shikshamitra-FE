'use client';

import type { AdmissionWorkflowNotification } from 'src/redux/student/admissions/admission-workflows-api';

import { fDateTime } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';
import { LoadingButton } from 'src/components/loading-button';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Alert, Card, Stack, Button, Typography, DialogActions } from '@mui/material';

type Props = {
  open: boolean;
  notifications?: AdmissionWorkflowNotification[];
  loading: boolean;
  markingId?: string | null;
  onClose: () => void;
  onOpenWorkflow: (notification: AdmissionWorkflowNotification) => void;
  onMarkRead: (notification: AdmissionWorkflowNotification) => Promise<void>;
};

export function WorkflowGovernanceNotificationsDialog({
  open,
  notifications,
  loading,
  markingId,
  onClose,
  onOpenWorkflow,
  onMarkRead,
}: Props) {
  return (
    <CustomDialog
      open={open}
      maxWidth="sm"
      title="Workflow notifications"
      handleClose={onClose}
      hasForm={false}
      guardUnsavedChanges={false}
    >
      <DialogScrollContent>
        <Stack spacing={1.5}>
          <Typography variant="body2" color="text.secondary">
            Review approval requests and publication updates assigned to you.
          </Typography>
          {loading && <Alert severity="info">Loading workflow notifications…</Alert>}
          {!loading && !notifications?.length && (
            <Alert severity="info">You have no workflow governance notifications.</Alert>
          )}
          {notifications?.map((notification) => (
            <Card key={notification.id} variant="outlined" sx={{ p: 1.5 }}>
              <Stack spacing={0.75}>
                <Stack
                  direction="row"
                  alignItems="flex-start"
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Typography fontWeight={notification.isRead ? 500 : 700}>
                    {notification.title}
                  </Typography>
                  {!notification.isRead && (
                    <Iconify icon="mdi:circle" width={10} color="primary.main" />
                  )}
                </Stack>
                <Typography variant="body2">{notification.message}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {fDateTime(notification.creationTime)}
                </Typography>
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  {!notification.isRead && (
                    <LoadingButton
                      size="small"
                      variant="text"
                      startIcon={<Iconify icon="mdi:email-check-outline" />}
                      loading={markingId === notification.id}
                      onClick={() => onMarkRead(notification)}
                    >
                      Mark read
                    </LoadingButton>
                  )}
                  <Button
                    size="small"
                    startIcon={<Iconify icon="mdi:arrow-right" />}
                    onClick={() => onOpenWorkflow(notification)}
                  >
                    Open workflow
                  </Button>
                </Stack>
              </Stack>
            </Card>
          ))}
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Iconify icon="mdi:close" />}
          onClick={onClose}
        >
          Close
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}

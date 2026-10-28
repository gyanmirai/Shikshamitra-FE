'use client';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { StudentFeedback } from 'src/components/student-feedback';
import { Box, Stack, Paper, Button, Typography } from '@mui/material';

import type { useBulkAdmissionOfferingActivation } from './use-bulk-admission-offering-activation';

type Props = {
  activation: ReturnType<typeof useBulkAdmissionOfferingActivation>;
  disabled: boolean;
};

export function BulkAdmissionOfferingActivation({ activation, disabled }: Props) {
  const count =
    activation.busy && activation.progress
      ? activation.progress.total
      : activation.selectedRows.length;

  if (!count && !activation.busy && !activation.failures.length) return null;

  return (
    <>
      <Paper variant="outlined" sx={{ p: 1, mb: 1, flexShrink: 0 }}>
        <Stack direction="row" alignItems="center" sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="body2" sx={{ flex: 1, minWidth: 120 }} role="status">
            {activation.busy && activation.progress
              ? `Activating ${activation.progress.completed} of ${activation.progress.total} offerings…`
              : `${count} ${count === 1 ? 'offering' : 'offerings'} selected`}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            color="inherit"
            startIcon={<Iconify icon="mdi:close" />}
            disabled={activation.busy}
            onClick={activation.clearSelection}
          >
            Clear
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<Iconify icon="mdi:check-circle-outline" />}
            loading={activation.busy}
            disabled={disabled || !count}
            onClick={activation.requestActivation}
            sx={{ ml: 'auto', bgcolor: 'text.primary', color: 'background.paper' }}
          >
            Activate Selected
          </Button>
        </Stack>
      </Paper>
      {activation.failures.length > 0 && (
        <StudentFeedback
          notificationKey="STU-0295"
          presentation="persistent"
          severity="error"
          sx={{ mb: 1, flexShrink: 0 }}
        >
          <Stack spacing={0.5} sx={{ maxHeight: 160, overflow: 'auto' }}>
            <Typography variant="subtitle2">Some offerings could not be activated.</Typography>
            {activation.failures.map((failure) => (
              <Typography key={failure.id} variant="body2">
                {failure.name}: {failure.message}
              </Typography>
            ))}
          </Stack>
        </StudentFeedback>
      )}
      <ConfirmDialog
        open={activation.confirmationOpen}
        onClose={activation.cancelActivation}
        title="Activate Admission Offerings?"
        aria-label="Activate Admission Offerings?"
        aria-describedby="bulk-offering-activation-description"
        icon={null}
        disableBackdropClick
        disableCancel={activation.busy}
        disableEscapeKeyDown={activation.busy}
        bodyBusy={activation.busy}
        busyLabel={
          activation.progress
            ? `Activating ${activation.progress.completed} of ${activation.progress.total} offerings…`
            : 'Activating offerings…'
        }
        content={
          <Box component="span" id="bulk-offering-activation-description">
            {count} selected {count === 1 ? 'offering' : 'offerings'} will become active.
          </Box>
        }
        action={
          <Button
            variant="contained"
            size="small"
            startIcon={<Iconify icon="mdi:check-circle-outline" />}
            disabled={activation.busy || disabled || !count}
            onClick={activation.confirmActivation}
            sx={{ bgcolor: 'text.primary', color: 'background.paper' }}
          >
            Activate
          </Button>
        }
      />
    </>
  );
}

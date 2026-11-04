'use client';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Box, Stack, Paper, Button, Typography } from '@mui/material';

import { AdmissionOfferingConfigurationIssues } from './admission-offering-configuration-issues';

import type { useBulkAdmissionOfferingActivation } from './use-bulk-admission-offering-activation';

type Props = {
  activation: ReturnType<typeof useBulkAdmissionOfferingActivation>;
  disabled: boolean;
  canReviewForms?: boolean;
  canRestoreForms?: boolean;
  canReviewWorkflows?: boolean;
};

export function BulkAdmissionOfferingActivation({
  activation,
  disabled,
  ...recoveryAccess
}: Props) {
  const count =
    activation.busy && activation.progress
      ? activation.progress.total
      : activation.selectedRows.length;

  if (!count && !activation.busy && !activation.failures.length) return null;
  const blocked = activation.failures.length > 0 && !activation.busy;
  const title = blocked ? 'Offering Activation Needs Changes' : 'Activate Admission Offerings?';

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
      <ConfirmDialog
        open={activation.confirmationOpen}
        onClose={activation.cancelActivation}
        title={title}
        aria-label={title}
        aria-describedby="bulk-offering-activation-description"
        icon={blocked ? 'warning' : null}
        cancelText={blocked ? 'Close' : 'Cancel'}
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
          <Box id="bulk-offering-activation-description">
            {blocked ? (
              <Scrollbar sx={{ maxHeight: 'min(440px, 55dvh)' }}>
                <Stack spacing={2}>
                  <Typography variant="body2">
                    Resolve these requirements, then retry the remaining offerings.
                  </Typography>
                  {activation.failures.map((failure) => (
                    <Stack key={failure.id} spacing={0.5}>
                      <Typography variant="subtitle2">{failure.name}</Typography>
                      {failure.configurationErrors?.length ? (
                        <AdmissionOfferingConfigurationIssues
                          errors={failure.configurationErrors}
                          {...recoveryAccess}
                        />
                      ) : (
                        <Typography variant="body2" role="alert">
                          {failure.message}
                        </Typography>
                      )}
                    </Stack>
                  ))}
                </Stack>
              </Scrollbar>
            ) : (
              `${count} selected ${count === 1 ? 'offering' : 'offerings'} will become active.`
            )}
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
            {blocked ? 'Retry activation' : 'Activate'}
          </Button>
        }
      />
    </>
  );
}

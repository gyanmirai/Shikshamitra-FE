import type { AdmissionFormArchiveImpact } from 'src/redux/student/admissions/admission-forms-api';

import { Iconify } from 'src/components/iconify';
import { Stack, Button, Typography } from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import type { PendingFormLifecycle } from './use-form-lifecycle-actions';

type Props = {
  pending: PendingFormLifecycle;
  impact?: AdmissionFormArchiveImpact;
  loading: boolean;
  busy: boolean;
  canConfirm: boolean;
  onClose: () => void;
  onConfirm: () => void;
  requiresReload?: boolean;
  onReload?: () => void;
};

export function FormLifecycleDialog({
  pending,
  impact,
  loading,
  busy,
  canConfirm,
  onClose,
  onConfirm,
  requiresReload,
  onReload,
}: Props) {
  const restoring = pending?.action === 'restore';
  const inquiry = pending?.form.purpose === 0;
  const outcome = restoring ? 'Restore' : 'Archive';
  const scoped = impact?.hasRestrictedOfferings || impact?.hasRestrictedDependencies;
  return (
    <ConfirmDialog
      open={Boolean(pending)}
      onClose={onClose}
      icon={restoring ? 'success' : 'warning'}
      title={`${outcome} ${inquiry ? 'Inquiry' : 'Registration'} Form?`}
      sx={
        restoring
          ? undefined
          : {
              '& .MuiDialogActions-root': { borderTop: 1, borderColor: 'divider' },
            }
      }
      disableBackdropClick
      disableCancel={busy}
      disableEscapeKeyDown={busy}
      lockOnActionLoading={!loading}
      content={
        <Stack spacing={1.5}>
          {restoring ? (
            <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
              {pending?.form.name}
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
              Are you sure you want to archive <strong>{pending?.form.name}</strong>?
              {impact && (
                <>
                  {' '}
                  This form is linked to{' '}
                  <strong>
                    {impact.offeringCount} {impact.offeringCount === 1 ? 'offering' : 'offerings'}
                  </strong>{' '}
                  and{' '}
                  <strong>
                    {impact.workflowCount} {impact.workflowCount === 1 ? 'workflow' : 'workflows'}
                  </strong>
                  {scoped && ' in your permitted scope'}.
                </>
              )}
            </Typography>
          )}
          {restoring && (
            <Typography variant="body2">
              Restore and publish the same form version. Existing links, saved answers and history
              are retained. Linked offerings and workflows can use it again when their other
              requirements are met.
            </Typography>
          )}
          {requiresReload && (
            <Button
              type="button"
              size="small"
              variant="text"
              disabled={loading || busy}
              startIcon={<Iconify icon="mdi:refresh" />}
              onClick={onReload}
            >
              Reload Latest
            </Button>
          )}
        </Stack>
      }
      action={
        <Button
          type="button"
          variant="contained"
          color="inherit"
          size="small"
          disabled={!canConfirm || busy || loading}
          loading={loading || busy}
          loadingPosition="start"
          startIcon={<Iconify icon={restoring ? 'mdi:restore' : 'mdi:archive-outline'} />}
          onClick={onConfirm}
        >
          {outcome}
        </Button>
      }
    />
  );
}

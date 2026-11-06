import type { AdmissionOfferingValidationError } from 'src/redux/student/admissions/admission-offerings-api';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Box, Stack, Button, Typography, LinearProgress } from '@mui/material';

import { AdmissionOfferingActionImpact } from './admission-offering-action-impact';
import { AdmissionOfferingConfigurationIssues } from './admission-offering-configuration-issues';

import type { PendingOfferingAction } from './use-admission-offering-actions';

type Props = {
  pendingAction: PendingOfferingAction;
  commanding: boolean;
  checkingRequirements?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  activationErrors?: AdmissionOfferingValidationError[];
  canReviewForms?: boolean;
  canRestoreForms?: boolean;
  canReviewWorkflows?: boolean;
  onEdit?: () => void;
};

export function AdmissionOfferingActionDialog({
  pendingAction,
  commanding,
  checkingRequirements = false,
  onClose,
  onConfirm,
  activationErrors = [],
  canReviewForms = false,
  canRestoreForms = false,
  canReviewWorkflows = false,
  onEdit,
}: Props) {
  const action = pendingAction?.type;
  const activating = action === 'activate';
  const actionLabel = action === 'delete' ? 'Delete' : activating ? 'Activate' : 'Deactivate';
  const blocked = activating && activationErrors.length > 0;
  const title = blocked ? 'Cannot Activate Offering' : `${actionLabel} Admission Offering?`;

  return (
    <ConfirmDialog
      open={Boolean(pendingAction)}
      onClose={onClose}
      icon={
        blocked ? (
          'error'
        ) : activating ? (
          <Iconify
            icon={GlobalIcons.tick}
            width={24}
            sx={{ color: 'success.main', flexShrink: 0 }}
          />
        ) : action === 'delete' ? (
          'error'
        ) : (
          'warning'
        )
      }
      title={title}
      aria-label={title}
      aria-describedby="offering-action-description"
      showCloseButton={activating}
      cancelText={blocked ? 'Close' : 'Cancel'}
      slotProps={activating ? { backdrop: { sx: { backdropFilter: 'blur(4px)' } } } : undefined}
      disableBackdropClick
      disableCancel={commanding}
      disableEscapeKeyDown={commanding}
      bodyBusy={activating ? commanding : undefined}
      busyLabel="Activating Offering…"
      content={
        action && pendingAction ? (
          <Box id="offering-action-description">
            {checkingRequirements ? (
              <Stack role="status" aria-label="Checking offering requirements" spacing={1.5}>
                <Typography variant="subtitle2">
                  {pendingAction.row.name || pendingAction.row.code}
                </Typography>
                <Typography variant="body2">Checking offering requirements…</Typography>
                <LinearProgress />
              </Stack>
            ) : blocked ? (
              <Stack spacing={1.5}>
                <Typography variant="subtitle2">
                  {pendingAction.row.name || pendingAction.row.code}
                </Typography>
                <AdmissionOfferingConfigurationIssues
                  errors={activationErrors}
                  canReviewForms={canReviewForms}
                  canRestoreForms={canRestoreForms}
                  canReviewWorkflows={canReviewWorkflows}
                />
                <Typography variant="body2">
                  Resolve the listed requirements, then activate this offering again.
                </Typography>
              </Stack>
            ) : (
              <AdmissionOfferingActionImpact action={action} offering={pendingAction.row} />
            )}
          </Box>
        ) : null
      }
      action={
        <Button
          type="button"
          variant="contained"
          size="small"
          color={action === 'delete' ? 'error' : blocked ? 'inherit' : 'primary'}
          loading={!activating && commanding}
          disabled={commanding || checkingRequirements}
          startIcon={
            <Iconify
              icon={
                action === 'delete'
                  ? 'mdi:delete-outline'
                  : blocked
                    ? GlobalIcons.edit
                    : activating
                      ? GlobalIcons.tick
                      : 'mdi:check-circle-outline'
              }
              width={activating ? 18 : undefined}
            />
          }
          onClick={blocked ? onEdit : onConfirm}
        >
          {blocked ? 'Edit offering' : actionLabel}
        </Button>
      }
    />
  );
}

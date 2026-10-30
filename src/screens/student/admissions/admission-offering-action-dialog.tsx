import { Box, Button } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import { AdmissionOfferingActionImpact } from './admission-offering-action-impact';

import type { PendingOfferingAction } from './use-admission-offering-actions';

type Props = {
  pendingAction: PendingOfferingAction;
  commanding: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function AdmissionOfferingActionDialog({
  pendingAction,
  commanding,
  onClose,
  onConfirm,
}: Props) {
  const action = pendingAction?.type;
  const activating = action === 'activate';
  const actionLabel = action === 'delete' ? 'Delete' : activating ? 'Activate' : 'Deactivate';
  const title = `${actionLabel} Admission Offering?`;

  return (
    <ConfirmDialog
      open={Boolean(pendingAction)}
      onClose={onClose}
      icon={
        activating ? (
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
      slotProps={activating ? { backdrop: { sx: { backdropFilter: 'blur(4px)' } } } : undefined}
      disableBackdropClick
      disableCancel={commanding}
      disableEscapeKeyDown={commanding}
      bodyBusy={activating ? commanding : undefined}
      busyLabel="Activating offering…"
      content={
        action && pendingAction ? (
          <Box id="offering-action-description">
            <AdmissionOfferingActionImpact action={action} offering={pendingAction.row} />
          </Box>
        ) : null
      }
      action={
        <Button
          type="button"
          variant="contained"
          size="small"
          color={action === 'delete' ? 'error' : 'primary'}
          loading={!activating && commanding}
          disabled={commanding}
          startIcon={
            <Iconify
              icon={
                action === 'delete'
                  ? 'mdi:delete-outline'
                  : activating
                    ? GlobalIcons.tick
                    : 'mdi:check-circle-outline'
              }
              width={activating ? 18 : undefined}
            />
          }
          onClick={onConfirm}
        >
          {actionLabel}
        </Button>
      }
    />
  );
}

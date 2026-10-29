import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Alert, Stack, Button, Typography } from '@mui/material';

import { permissionLabel } from './permission-catalogue';

import type { useVisibilityPrerequisite } from './use-visibility-prerequisite';

export default function VisibilityPrerequisiteDialog({
  open,
  disabled,
  unavailable,
  required,
  onClose,
  onConfirm,
}: ReturnType<typeof useVisibilityPrerequisite>['confirmation']) {
  return (
    <ConfirmDialog
      open={open}
      title="Enable Navigation Visibility?"
      icon="warning"
      onClose={onClose}
      content={
        <Stack spacing={1.5}>
          <Typography variant="body2">
            Enabling module permissions will automatically grant Navigation Visibility for the
            following features. Do you wish to proceed?
          </Typography>
          <Stack component="ul" sx={{ pl: 2, m: 0 }}>
            {required.map((entry) => (
              <Typography key={entry.name} component="li" variant="body2">
                {permissionLabel(entry)}
              </Typography>
            ))}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            These changes stay in your draft until you review and save them.
          </Typography>
          {unavailable && (
            <Alert severity="warning">
              Required permissions or visibility cannot be changed for this role or user. Check Set
              Visibility before granting these permissions.
            </Alert>
          )}
        </Stack>
      }
      action={
        <Button variant="contained" color="inherit" disabled={disabled} onClick={onConfirm}>
          Enable visibility and grant
        </Button>
      }
    />
  );
}

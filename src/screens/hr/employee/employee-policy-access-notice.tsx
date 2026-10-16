import CloseIcon from '@mui/icons-material/Close';
import { useId, useState, useEffect } from 'react';
import RefreshIcon from '@mui/icons-material/Refresh';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Alert, Stack, Button, Typography, DialogActions } from '@mui/material';

import type { useEmployeePolicyAccess } from './use-employee-policy-access';

type Props = { access: ReturnType<typeof useEmployeePolicyAccess> };

export function EmployeePolicyAccessNotice({ access }: Props) {
  const descriptionId = useId();
  const [dismissed, setDismissed] = useState<string | null>(null);
  useEffect(() => {
    if (!access.blocked) setDismissed(null);
  }, [access.blocked]);
  const issueKey = access.blocked
    ? access.requirements.map((item) => item.name).join('|') || 'assignment'
    : null;
  const open = issueKey !== null && dismissed !== issueKey;
  const close = () => {
    if (!access.checking) setDismissed(issueKey);
  };

  if (!access.blocked && !access.defaults.hasError) return null;

  return (
    <Box sx={{ p: 2 }}>
      {access.blocked ? (
        <Alert
          severity="warning"
          action={
            <Button color="inherit" size="small" onClick={() => setDismissed(null)}>
              Review required access
            </Button>
          }
        >
          Policy access is required before this staff member can be added.
        </Alert>
      ) : (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              disabled={access.defaults.loading}
              onClick={access.defaults.retry}
              startIcon={<RefreshIcon />}
            >
              Retry
            </Button>
          }
        >
          Default policies could not be loaded. Please retry. Your entered details are kept.
        </Alert>
      )}
      <CustomDialog
        open={open}
        title="Policy Access Required"
        handleClose={close}
        hasForm={false}
        guardUnsavedChanges={false}
        disableClose={access.checking}
        aria-describedby={descriptionId}
        maxWidth="sm"
      >
        <DialogScrollContent>
          <Stack spacing={2}>
            <Typography id={descriptionId} variant="body2">
              To add a staff member, your account needs access to read and assign the school’s
              default leave, attendance and payroll policies. Ask your system administrator to grant
              the required access, then check again. Your entered details are kept.
            </Typography>
            {access.requirements.length > 0 && (
              <Box component="ul" sx={{ m: 0, pl: 3 }}>
                {access.requirements.map((item) => (
                  <Typography component="li" variant="body2" key={item.name}>
                    {item.label}
                  </Typography>
                ))}
              </Box>
            )}
            {access.refreshError && <Alert severity="error">{access.refreshError}</Alert>}
          </Stack>
        </DialogScrollContent>
        <DialogActions sx={{ p: 2, flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            onClick={close}
            disabled={access.checking}
            startIcon={<CloseIcon />}
          >
            Close
          </Button>
          <Button
            variant="contained"
            color="inherit"
            size="small"
            onClick={access.checkAccess}
            loading={access.checking}
            startIcon={<RefreshIcon />}
          >
            Check access again
          </Button>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
}

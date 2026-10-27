import type { RootState } from 'src/redux/store';

import { useContext } from 'react';
import { useSelector } from 'react-redux';
import { EmptyContent } from 'src/components/empty-content';
import { hasGrantedPermission } from 'src/utils/permissions';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import { Alert, Stack, Button, Typography } from '@mui/material';
import { hrSetupAction } from 'src/screens/hr/recovery/hr-setup';
import { HrSetupRefresh, RecoveryContext } from 'src/screens/hr/recovery/hr-setup-controls';

export function SalaryTemplateSetupState({
  failed = false,
  accessDenied = false,
  busy,
  refresh,
  onboarding = false,
}: {
  failed?: boolean;
  accessDenied?: boolean;
  busy: boolean;
  refresh: () => Promise<unknown>;
  onboarding?: boolean;
}) {
  const { permissions, loading, permissionsInitialized } = useSelector(
    (state: RootState) => state.auth
  );
  const { beginSetup } = useContext(RecoveryContext);
  const canCreate =
    hrSetupAction('templates', permissions, Boolean(!loading && permissionsInitialized)) &&
    hasGrantedPermission(permissions, hrPermissions.payroll.settings.salaryTemplateActions.add);
  const retry = <HrSetupRefresh refresh={refresh} disabled={busy} />;

  if (failed) {
    return (
      <Alert severity={accessDenied ? 'warning' : 'error'}>
        <Stack spacing={1} alignItems="flex-start">
          <Typography variant="subtitle2">
            {accessDenied
              ? 'Salary template access unavailable'
              : 'Salary templates could not be loaded'}
          </Typography>
          <Typography variant="body2">
            {accessDenied
              ? 'Ask your HR administrator to review your salary template access, then refresh setup.'
              : 'Refresh setup to try again. Your entries are still here.'}
          </Typography>
          {retry}
        </Stack>
      </Alert>
    );
  }

  return (
    <EmptyContent
      filled
      title="No active salary templates"
      description={
        onboarding
          ? 'A reusable salary template is required before you can preview salary and finalize onboarding.'
          : 'A reusable salary template is required before you can preview and save staff salary.'
      }
      sx={{ py: 3, minHeight: 0 }}
      slotProps={{ img: { width: 96, height: 96 } }}
      action={
        <Stack spacing={1.5} alignItems="center" sx={{ mt: 2, maxWidth: 520 }}>
          {canCreate ? (
            <Button
              size="small"
              variant="contained"
              href={hrPaths.payroll.settings.salaryTemplateCreate}
              target="_blank"
              rel="noopener noreferrer"
              disabled={busy}
              onClick={beginSetup}
              aria-label="Create salary template (opens in a new tab)"
            >
              Create salary template (new tab)
            </Button>
          ) : loading || !permissionsInitialized ? (
            <Typography variant="body2" role="status">
              Checking salary template setup access…
            </Typography>
          ) : (
            <Typography variant="body2" textAlign="center">
              Ask an authorized HR administrator to create and publish a salary template.
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Keep this {onboarding ? 'onboarding' : 'salary'} tab open to preserve your draft. After
            an authorized user publishes the template, return here and refresh setup. Review the
            choices and preview salary again.
          </Typography>
          {retry}
        </Stack>
      }
    />
  );
}

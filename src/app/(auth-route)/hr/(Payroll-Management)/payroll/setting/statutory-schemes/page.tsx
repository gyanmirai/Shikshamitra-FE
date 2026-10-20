'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { useSearchParams } from 'next/navigation';
import { RouterLink } from 'src/routes/components';
import { Box, Tab, Alert, Button } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { hasGrantedPermission } from 'src/utils/permissions';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import EsiPolicies from 'src/screens/hr/payroll/setting/esi-policies';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetEsiConfigurationQuery } from 'src/redux/hr/esi-configuration-api';
import EsiStatutorySettings from 'src/screens/hr/payroll/setting/esi-statutory-settings';

export default function StatutorySchemesPage() {
  const view = useSearchParams().get('view') === 'policies' ? 'policies' : 'configuration';
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canView = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.settings.statutorySchemes
  );
  const configuration = useGetEsiConfigurationQuery(undefined, { skip: !canView });
  return (
    <Box sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Statutory Schemes"
        description="Configure ESIC and review its effect on payroll."
        links={[
          { name: 'HR/Staff', href: hrPaths.dashboard },
          { name: 'Payroll Management', href: hrPaths.payroll.root },
          { name: 'Settings', href: hrPaths.payroll.settings.root },
          { name: 'Statutory Schemes' },
        ]}
      />
      {canView ? (
        <>
          <CustomTabs
            value={view}
            guardUnsavedChanges={false}
            aria-label="ESIC settings areas"
            sx={{ mb: 2 }}
          >
            <Tab
              value="configuration"
              id="esi-configuration-tab"
              aria-controls="esi-configuration-panel"
              label="School settings"
              icon={<Iconify icon="solar:settings-bold" />}
              component={RouterLink}
              href={hrPaths.payroll.settings.statutorySchemes}
            />
            <Tab
              value="policies"
              id="esi-policies-tab"
              aria-controls="esi-policies-panel"
              label="ESIC Policies"
              icon={<Iconify icon="solar:document-text-bold" />}
              component={RouterLink}
              href={hrPaths.payroll.settings.esiPolicies}
            />
          </CustomTabs>
          <Box
            role="tabpanel"
            id={`esi-${view}-panel`}
            aria-labelledby={`esi-${view}-tab`}
            sx={{ flex: 1, minHeight: 0, minWidth: 0, overflowY: 'auto', overflowX: 'hidden' }}
          >
            {view === 'policies' ? (
              configuration.isError ? (
                <Alert
                  severity="error"
                  action={<Button onClick={() => configuration.refetch()}>Retry</Button>}
                >
                  ESIC settings could not be loaded.
                </Alert>
              ) : (
                <EsiPolicies hasSchoolWideScope={configuration.data?.hasSchoolWideScope === true} />
              )
            ) : (
              <EsiStatutorySettings />
            )}
          </Box>
        </>
      ) : (
        <Alert severity="info">You do not have access to ESIC settings.</Alert>
      )}
    </Box>
  );
}

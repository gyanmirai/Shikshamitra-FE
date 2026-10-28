'use client';

import type { RootState } from 'src/redux/store';

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { View403 } from 'src/sections/error';
import { hrPermissions } from 'src/constants/hr-menus';
import { SplashScreen } from 'src/components/loading-screen';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useGetTenantByIdQuery } from 'src/redux/tenant/tenantApi';
import { hrRecoveryScope } from 'src/screens/hr/recovery/hr-recovery-events';
import { HrSetupCoordinator } from 'src/screens/hr/setup/hr-setup-coordinator';
import { HrRecoveryProvider } from 'src/screens/hr/recovery/hr-recovery-provider';
import { TableExportContext } from 'src/components/customizabaleTable/export-context';

const HRLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const auth = useSelector((state: RootState) => state.auth);
  const { permissions, loading, permissionsInitialized, user } = useSelector(
    (state: RootState) => state.auth
  );
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const school = useGetTenantByIdQuery(user?.profile?.tenantid, { skip: !user?.profile?.tenantid });
  const exportContext = useMemo(
    () =>
      [
        school.data?.extraProperties?.InstituteName || school.data?.name || 'School workspace',
        currentYear?.name ? `Academic year: ${currentYear.name}` : '',
      ].filter(Boolean),
    [school.data, currentYear]
  );

  const hasPermission = hasGrantedPermission(permissions, hrPermissions.root);

  if (loading || !permissionsInitialized) return <SplashScreen />;
  return hasPermission ? (
    <TableExportContext.Provider value={exportContext}>
      <HrRecoveryProvider key={hrRecoveryScope(auth)}>
        {children}
        <HrSetupCoordinator />
      </HrRecoveryProvider>
    </TableExportContext.Provider>
  ) : (
    <View403 />
  );
};

export default HRLayout;

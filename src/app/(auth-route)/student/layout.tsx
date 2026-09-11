'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { View403 } from 'src/sections/error';
import { usePathname } from 'next/navigation';
import { SplashScreen } from 'src/components/loading-screen';
import { hasGrantedPermission } from 'src/utils/permissions';
import { studentPermissions } from 'src/constants/student-menu';

const StudentLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const pathname = usePathname();
  const { permissions, loading, permissionsInitialized } = useSelector(
    (state: RootState) => state.auth
  );

  const hasPermission = hasGrantedPermission(permissions, studentPermissions.root);
  // TODO(admissions): Remove this route-scoped bypass after development roles are seeded.
  const isDevelopmentAdmissionsRoute =
    process.env.NODE_ENV !== 'production' && pathname.startsWith('/student/admissions');

  if (!isDevelopmentAdmissionsRoute && (loading || !permissionsInitialized)) return <SplashScreen />;
  return hasPermission || isDevelopmentAdmissionsRoute ? children : <View403 />;
};

export default StudentLayout;

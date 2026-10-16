'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { View403 } from 'src/sections/error';
import { usePathname } from 'next/navigation';
import { SplashScreen } from 'src/components/loading-screen';
import { canAccessAcademicRoute } from 'src/utils/academic-navigation-access';
import { AcademicModuleUiProvider } from 'src/screens/academic/components/AcademicModuleUiProvider';

const AcademicLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { permissions, loading, permissionsInitialized } = useSelector(
    (state: RootState) => state.auth
  );

  const pathname = usePathname();
  const hasPermission = canAccessAcademicRoute(pathname, permissions);

  if (loading || !permissionsInitialized) return <SplashScreen />;
  return hasPermission ? (
    <AcademicModuleUiProvider>{children}</AcademicModuleUiProvider>
  ) : (
    <View403 />
  );
};

export default AcademicLayout;

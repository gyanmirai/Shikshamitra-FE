'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { View403 } from 'src/sections/error';
import { SplashScreen } from 'src/components/loading-screen';
import { hasGrantedPermission } from 'src/utils/permissions';
import { studentPermissions } from 'src/constants/student-menu';
import StudentSetupEntry from 'src/screens/student/setup/StudentSetupEntry';
import { StudentFeedbackScope } from 'src/screens/student/student-feedback-scope';
import { StudentDrawerMotionProvider } from 'src/screens/student/components/student-drawer-motion-provider';

const StudentLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { permissions, loading, permissionsInitialized } = useSelector(
    (state: RootState) => state.auth
  );

  const hasPermission = hasGrantedPermission(permissions, studentPermissions.root);
  if (loading || !permissionsInitialized) return <SplashScreen />;
  return hasPermission ? (
    <StudentDrawerMotionProvider>
      <StudentFeedbackScope>
        <StudentSetupEntry>{children}</StudentSetupEntry>
      </StudentFeedbackScope>
    </StudentDrawerMotionProvider>
  ) : (
    <View403 />
  );
};

export default StudentLayout;

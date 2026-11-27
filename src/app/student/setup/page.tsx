import StudentSetupScreen from 'src/screens/student/setup';
import AuthRouteLayout from 'src/components/auth-route-layout';
import { StudentDrawerMotionProvider } from 'src/screens/student/components/student-drawer-motion-provider';

export const dynamic = 'force-dynamic';

export default function StudentSetupPage() {
  return (
    <AuthRouteLayout>
      <StudentDrawerMotionProvider>
        <StudentSetupScreen />
      </StudentDrawerMotionProvider>
    </AuthRouteLayout>
  );
}

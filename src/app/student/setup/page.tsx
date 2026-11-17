import StudentSetupScreen from 'src/screens/student/setup';
import AuthRouteLayout from 'src/components/auth-route-layout';

export const dynamic = 'force-dynamic';

export default function StudentSetupPage() {
  return <AuthRouteLayout><StudentSetupScreen /></AuthRouteLayout>;
}

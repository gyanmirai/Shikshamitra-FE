import AcademicSetupScreen from 'src/screens/academic/setup';
import AuthRouteLayout from 'src/components/auth-route-layout';

export const dynamic = 'force-dynamic';

export default function AcademicSetupPage() {
  return <AuthRouteLayout><AcademicSetupScreen /></AuthRouteLayout>;
}

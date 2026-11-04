import FinanceSetupScreen from 'src/screens/finance/setup';
import AuthRouteLayout from 'src/components/auth-route-layout';

export const dynamic = 'force-dynamic';

export default function FinanceSetupPage() {
  return (
    <AuthRouteLayout>
      <FinanceSetupScreen />
    </AuthRouteLayout>
  );
}

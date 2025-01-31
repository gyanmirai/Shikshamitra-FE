import { DashboardLayout } from 'src/layouts/dashboard';

import SubLayout from 'src/components/sub-layout';
import AuthRouteLayout from 'src/components/auth-route-layout';

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <AuthRouteLayout>
    <DashboardLayout>
      <SubLayout>{children}</SubLayout>
    </DashboardLayout>
  </AuthRouteLayout>
);

export default AuthLayout;

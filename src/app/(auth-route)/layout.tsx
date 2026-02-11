import SubLayout from 'src/components/sub-layout';
import { DashboardLayout } from 'src/layouts/dashboard';
import PageTransition from 'src/components/page-transition';
import AuthRouteLayout from 'src/components/auth-route-layout';
import OnboardingProvider from 'src/components/onboarding/onboarding-provider';

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <AuthRouteLayout>
    <OnboardingProvider>
      <DashboardLayout>
        <SubLayout>
          <PageTransition>{children}</PageTransition>
        </SubLayout>
      </DashboardLayout>
    </OnboardingProvider>
  </AuthRouteLayout>
);

export default AuthLayout;

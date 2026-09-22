import SubLayout from 'src/components/sub-layout';
import { DashboardLayout } from 'src/layouts/dashboard';
import PageTransition from 'src/components/page-transition';
import AuthRouteLayout from 'src/components/auth-route-layout';
import OnboardingProvider from 'src/components/onboarding/onboarding-provider';

// Protected application screens depend on per-request authentication and user state.
// Keep them out of static prerendering so production builds do not serialize a shared
// authenticated shell as public HTML.
export const dynamic = 'force-dynamic';

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
